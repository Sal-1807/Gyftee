"""
models.py — Pydantic request/response schemas for the ML service API.

Pydantic validates incoming request data and serializes outgoing responses.
It's FastAPI's type system — if the request doesn't match the schema, FastAPI
automatically returns a 422 Unprocessable Entity error with a clear message.
"""

from pydantic import BaseModel, Field


class RecommendationRequest(BaseModel):
    """Body sent by the Next.js API route to the Python service."""

    user_id: str = Field(..., description="PocketBase user record ID")
    n: int = Field(default=20, ge=1, le=100, description="Number of recommendations to return")
    interests: list[str] = Field(default=[], description="Onboarding categories, used for cold-start ordering")


class RecommendationResponse(BaseModel):
    """Response returned to Next.js, which forwards it to the browser."""

    gift_ids: list[str] = Field(description="Ranked gift IDs, best match first")

    model_weights: dict[str, float] = Field(
        description="Active model weights, e.g. {'content': 0.6, 'collab': 0.4}"
    )

    user_swipe_count: int = Field(
        description="Total swipes by this user (liked + disliked)"
    )

    # True if PocketBase or the model was unavailable → caller shows default gifts
    fallback: bool = Field(default=False)


class ModelInfoResponse(BaseModel):
    """Diagnostic information about the trained models."""

    content_based: dict
    collaborative_filtering: dict
    total_gifts: int
    total_swipes: int
