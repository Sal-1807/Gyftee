"""
main.py — FastAPI application entrypoint for the Gyftee ML service.

Endpoints:
  GET  /health           → health check (use this to verify the service is up)
  POST /recommendations  → get personalized gift recommendations for a user
  GET  /model/info       → diagnostic info about the trained models (educational!)

Run locally:
  uvicorn main:app --reload --port 8000

The --reload flag restarts the server automatically when you edit Python files.
"""

import asyncio
import hmac
import os
import random
from contextlib import asynccontextmanager

from dotenv import load_dotenv
from fastapi import Depends, FastAPI, Header, HTTPException
from fastapi.middleware.cors import CORSMiddleware

load_dotenv()

from models import RecommendationRequest, RecommendationResponse, ModelInfoResponse
from recommendations import HybridRecommender
from pocketbase_client import fetch_all_gifts, fetch_all_swipes, fetch_user_swipes


# ─────────────────────────────────────────────────────────────────────────────
# Global model state
# ─────────────────────────────────────────────────────────────────────────────
# We keep ONE recommender instance alive for the lifetime of the server process.
# This avoids re-training on every request (training takes ~50-500ms).
# In production systems this is called "model serving."

recommender = HybridRecommender()
_all_gift_ids: list[str] = []        # Used for cold-start ordering
_gift_category_map: dict[str, str] = {}  # gift_id → category, for interest-aware cold start
_total_swipes: int = 0


# ─────────────────────────────────────────────────────────────────────────────
# Background auto-retrain
# ─────────────────────────────────────────────────────────────────────────────

async def _auto_retrain_loop() -> None:
    """Retrains models every 30 minutes so new swipes are picked up automatically."""
    global _all_gift_ids, _gift_category_map, _total_swipes
    while True:
        await asyncio.sleep(1800)  # 30 minutes
        try:
            gifts = await fetch_all_gifts()
            swipes = await fetch_all_swipes()
            _all_gift_ids = [g["id"] for g in gifts]
            _gift_category_map = {g["id"]: g.get("category", "") for g in gifts}
            _total_swipes = len(swipes)
            recommender.fit(gifts, swipes)
            print(f"[Gyftee ML] Auto-retrain complete — {len(gifts)} gifts, {len(swipes)} swipes")
        except Exception as e:
            print(f"[Gyftee ML] Auto-retrain failed: {e}")


# ─────────────────────────────────────────────────────────────────────────────
# Startup / Shutdown lifecycle
# ─────────────────────────────────────────────────────────────────────────────

@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    FastAPI lifespan event: code before `yield` runs on startup,
    code after `yield` runs on shutdown.

    On startup:
      1. Fetch all gifts from PocketBase
      2. Fetch all swipes from PocketBase
      3. Train both sub-models (TF-IDF + SVD)

    This is the "model training" phase. It runs ONCE when the server starts.
    Subsequent recommendation requests just run inference (scoring), which
    is very fast (<10ms per request).

    Note: If PocketBase isn't running yet, this will print a warning and
    the models will be untrained. Restart the ML service after PocketBase is up.
    """
    global _all_gift_ids, _gift_category_map, _total_swipes

    print("[Gyftee ML] Starting up — fetching training data from PocketBase...")

    try:
        gifts = await fetch_all_gifts()
        swipes = await fetch_all_swipes()

        _all_gift_ids = [g["id"] for g in gifts]
        _gift_category_map = {g["id"]: g.get("category", "") for g in gifts}
        _total_swipes = len(swipes)

        print(f"[Gyftee ML] Training on {len(gifts)} gifts and {len(swipes)} swipes...")
        recommender.fit(gifts, swipes)
        print("[Gyftee ML] Models trained and ready.")

    except Exception as e:
        # PocketBase might not be running yet — that's OK.
        # The service starts but all recommendations will be cold-start (random).
        print(f"[Gyftee ML] WARNING: Could not fetch training data: {e}")
        print("[Gyftee ML] Service is up but running in cold-start mode.")
        print("[Gyftee ML] Restart after PocketBase is running to train the models.")

    retrain_task = asyncio.create_task(_auto_retrain_loop())

    yield  # ← server runs while we're here

    retrain_task.cancel()
    try:
        await retrain_task
    except asyncio.CancelledError:
        pass
    print("[Gyftee ML] Shutting down.")


# ─────────────────────────────────────────────────────────────────────────────
# FastAPI app
# ─────────────────────────────────────────────────────────────────────────────

app = FastAPI(
    title="Gyftee ML Service",
    description="Hybrid recommendation engine: TF-IDF content-based + SVD collaborative filtering",
    version="1.0.0",
    lifespan=lifespan,
)

# CORS: allow requests from the Next.js dev server and Vercel production URL
_frontend_url = os.getenv("FRONTEND_URL", "https://gyftee.vercel.app")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        _frontend_url,
    ],
    allow_methods=["GET", "POST"],
    allow_headers=["*"],
)


# ─────────────────────────────────────────────────────────────────────────────
# Internal authentication
# ─────────────────────────────────────────────────────────────────────────────
# This service is only ever called server-to-server by the Next.js API route,
# never by a browser, so a shared secret is enough — no JWT/OAuth needed.
#
# CORS above is NOT access control: it is a browser policy and does nothing to
# stop curl or any other non-browser client. This dependency is what actually
# keeps the internet out of /recommendations, /retrain and /model/info.

INTERNAL_API_TOKEN = os.getenv("INTERNAL_API_TOKEN", "")


async def require_internal_token(x_internal_token: str | None = Header(default=None)) -> None:
    """
    Guard for internal endpoints. FastAPI maps `x_internal_token` to the
    `X-Internal-Token` request header.

    Fails CLOSED: if INTERNAL_API_TOKEN isn't configured, protected endpoints
    are unavailable rather than open to everyone.
    """
    if not INTERNAL_API_TOKEN:
        print("[Gyftee ML] INTERNAL_API_TOKEN is not configured — refusing protected request")
        raise HTTPException(status_code=503, detail="Service not configured")

    # compare_digest avoids leaking the token through response-timing.
    if not x_internal_token or not hmac.compare_digest(x_internal_token, INTERNAL_API_TOKEN):
        raise HTTPException(status_code=401, detail="Unauthorized")


# ─────────────────────────────────────────────────────────────────────────────
# Endpoints
# ─────────────────────────────────────────────────────────────────────────────

@app.get("/health")
async def health():
    """Health check. Returns 200 OK if the service is running."""
    return {"status": "ok", "models_trained": len(_all_gift_ids) > 0}


@app.post(
    "/recommendations",
    response_model=RecommendationResponse,
    dependencies=[Depends(require_internal_token)],
)
async def get_recommendations(req: RecommendationRequest):
    """
    Get personalized gift recommendations for a user.

    Flow:
      1. Fetch this user's swipes from PocketBase (real-time — reflects latest swipes)
      2. Determine content/collaborative weights based on swipe count
      3. Run the hybrid recommender
      4. If cold start (no swipes), return a random shuffle of all gifts

    WHY fetch user swipes on every request (not from training data)?
      → The user may have swiped since the model was trained at startup.
      → We want real-time personalization, not stale data.
      → This is called "online inference" with "stale training data" — a common
        pattern in recommendation systems.
    """
    try:
        user_swipes = await fetch_user_swipes(req.user_id)
    except Exception as e:
        # Detail stays server-side: the exception text can carry the internal
        # PocketBase URL and upstream response bodies.
        print(f"[Gyftee ML] fetch_user_swipes failed: {type(e).__name__}")
        raise HTTPException(status_code=503, detail="Upstream data source unavailable")

    liked_ids    = [s["gift"] for s in user_swipes if s.get("liked") is True]
    disliked_ids = [s["gift"] for s in user_swipes if s.get("liked") is False]
    n_liked      = len(liked_ids)
    total_swipes = len(user_swipes)

    # Compute weights for the response (so UI can show them)
    w_content, w_collab = recommender.get_weights(n_liked)
    weights = {"content": w_content, "collab": w_collab}

    # ── Cold start: no swipe history at all ───────────────────────────────────
    if total_swipes == 0:
        if req.interests:
            # Put gifts whose category matches an onboarding interest first,
            # then fill the rest in random order.
            interest_set = set(req.interests)
            matched = [gid for gid in _all_gift_ids if _gift_category_map.get(gid) in interest_set]
            others  = [gid for gid in _all_gift_ids if _gift_category_map.get(gid) not in interest_set]
            random.shuffle(matched)
            random.shuffle(others)
            cold_ids = (matched + others)[: req.n]
        else:
            shuffled = _all_gift_ids.copy()
            random.shuffle(shuffled)
            cold_ids = shuffled[: req.n]
        return RecommendationResponse(
            gift_ids=cold_ids,
            model_weights={"content": 1.0, "collab": 0.0},
            user_swipe_count=0,
        )

    # ── Normal case: user has swipe history ──────────────────────────────────
    gift_ids = recommender.recommend(
        user_id=req.user_id,
        liked_ids=liked_ids,
        disliked_ids=disliked_ids,
        n=req.n,
    )

    # If recommender returned empty (all gifts already swiped), send everything shuffled
    if not gift_ids:
        shuffled = _all_gift_ids.copy()
        random.shuffle(shuffled)
        gift_ids = shuffled[: req.n]

    return RecommendationResponse(
        gift_ids=gift_ids,
        model_weights=weights,
        user_swipe_count=total_swipes,
    )


@app.post("/retrain", dependencies=[Depends(require_internal_token)])
async def retrain():
    """
    Retrain the models with the latest data from PocketBase.

    Call this after adding new gifts or after a burst of swipe activity
    to refresh the collaborative filtering matrix without restarting the server.
    """
    global _all_gift_ids, _gift_category_map, _total_swipes
    try:
        gifts = await fetch_all_gifts()
        swipes = await fetch_all_swipes()
        _all_gift_ids = [g["id"] for g in gifts]
        _gift_category_map = {g["id"]: g.get("category", "") for g in gifts}
        _total_swipes = len(swipes)
        recommender.fit(gifts, swipes)
        return {"status": "ok", "gifts": len(gifts), "swipes": len(swipes)}
    except Exception as e:
        print(f"[Gyftee ML] Retrain failed: {type(e).__name__}")
        raise HTTPException(status_code=503, detail="Retrain failed")


@app.get(
    "/model/info",
    response_model=ModelInfoResponse,
    dependencies=[Depends(require_internal_token)],
)
async def model_info():
    """
    Diagnostic endpoint — shows what the trained models look like.

    This is especially useful for learning:
      - vocabulary_size: how many unique words/tags the TF-IDF model learned
      - n_users: how many users are in the collaborative filtering matrix
      - n_latent_factors: the k value in U × Σ × Vᵀ
      - status: "trained" or "not enough data"

    Try hitting this endpoint in your browser after training:
      http://localhost:8000/model/info
    """
    cb = recommender.content
    cf = recommender.collab

    vocab_size = 0
    if hasattr(cb.tfidf, "vocabulary_"):
        vocab_size = len(cb.tfidf.vocabulary_)

    return ModelInfoResponse(
        content_based={
            "n_gifts_indexed": len(cb.gift_ids),
            "vocabulary_size": vocab_size,
            "status": "trained" if cb.gift_matrix is not None else "not trained",
            "explanation": (
                "TF-IDF matrix maps each gift to a vector of tag importance scores. "
                f"vocabulary_size = number of unique words/tags across all {len(cb.gift_ids)} gifts."
            ),
        },
        collaborative_filtering={
            "n_users": len(cf.user_ids),
            "n_gifts_in_matrix": len(cf.gift_ids),
            "n_latent_factors": cf.N_FACTORS,
            "status": "trained" if cf.user_factors is not None else "not enough data yet",
            "explanation": (
                "SVD decomposes the user-item matrix into latent taste dimensions. "
                f"n_latent_factors={cf.N_FACTORS} means each user and gift is represented "
                f"as a {cf.N_FACTORS}-dimensional vector."
            ),
        },
        total_gifts=len(_all_gift_ids),
        total_swipes=_total_swipes,
    )
