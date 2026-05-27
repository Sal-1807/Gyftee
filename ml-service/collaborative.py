"""
collaborative.py — SVD Collaborative Filtering for Gyftee ML service

WHAT THIS MODULE DOES:
  Answers the question: "Which users have similar taste to this user,
  and what did THEY like that this user hasn't seen yet?"

LESSONS COVERED:
  - The User-Item interaction matrix
  - Sparse data problem and why we need SVD
  - Singular Value Decomposition (SVD) — the math behind Netflix recommendations
  - Latent factors: hidden taste dimensions
  - Cold start problem and why collaborative filtering needs enough data
"""

import numpy as np
import pandas as pd
from sklearn.decomposition import TruncatedSVD
from sklearn.preprocessing import normalize


# =============================================================================
# LESSON 5: Collaborative Filtering — "Users Like You"
# =============================================================================
#
# Core idea: if two users have liked many of the same gifts, they have similar
# taste. When one of them likes something the other hasn't seen — recommend it.
#
# This is "wisdom of the crowd" applied to personal taste.
# Netflix, Spotify, Amazon, TikTok all use variants of this.
#
# Unlike content-based filtering, collaborative filtering doesn't need to
# know ANYTHING about what a gift actually is. It only needs to know
# WHO LIKED WHAT.
# =============================================================================

# =============================================================================
# LESSON 6: The User-Item Matrix
# =============================================================================
#
# We represent all interactions as a 2D table:
#   Rows    = users
#   Columns = gifts
#   Values  = interaction score (+1 liked, -0.5 disliked, 0 not seen)
#
#             keyboard  mouse  yoga-mat  cookbook  headphones
#   Alice:        1       1        0         0         1
#   Bob:          1       0        0         0         1
#   Carol:        0       0        1         1         0
#   Dave:         1       1        0         1         1
#   You:          1       0        0         0         ?  ← predict
#
# Dave liked keyboard + mouse + headphones (like you) AND cookbook.
# Collaborative filtering predicts: you might like cookbook too.
#
# The matrix is HUGE (millions of users × millions of items in real apps)
# and SPARSE (mostly zeros — users only see a tiny fraction of all items).
# We need a way to compress it. That's what SVD does.
# =============================================================================

# =============================================================================
# LESSON 7: SVD (Singular Value Decomposition)
# =============================================================================
#
# SVD is a mathematical technique that decomposes a matrix M into 3 matrices:
#
#   M ≈ U × Σ × Vᵀ
#
#   M  shape: (n_users,  n_gifts)   ← the original interaction matrix
#   U  shape: (n_users,  k)         ← where each USER "lives" in taste space
#   Σ  shape: (k,        k)         ← how important each dimension is
#   Vᵀ shape: (k,        n_gifts)   ← where each GIFT "lives" in taste space
#   k  = number of "latent factors" (we choose this, typically 20-50)
#
# What are "latent factors"?
#   They're hidden dimensions that SVD discovers automatically from the data.
#   With enough data, they often correspond to real taste patterns:
#     Factor 1 might capture "Tech enthusiast"
#     Factor 2 might capture "Fitness person"
#     Factor 3 might capture "Homebody"
#   But they're learned from swipe patterns, not defined by us.
#
# After SVD:
#   - Each user has coordinates in a k-dimensional "taste space"
#   - Each gift has coordinates in the same k-dimensional space
#   - Recommendation = find gifts closest to the user in that space
#   - Distance = dot product between user vector and gift vector
#
# This is the same math behind Word2Vec, movie recommendations, and
# many other "embed things in a vector space" ML techniques.
# =============================================================================


class CollaborativeFilteringRecommender:
    """
    SVD-based collaborative filtering.

    Minimum data requirements:
      - At least 2 users must have swiped (SVD needs rows)
      - At least N_FACTORS gifts must have been swiped (SVD needs columns)
      - A specific user needs at least MIN_SWIPES likes to get collab recs

    When data is insufficient, return empty list → hybrid.py falls back
    to content-based recommendations automatically.
    """

    # Minimum swipes before collaborative filtering is trusted for a user.
    # With fewer swipes, there's not enough signal to find "users like you."
    MIN_SWIPES_FOR_USER = 5

    # Number of latent factors (k in the math above).
    # More factors = captures more nuance, but needs more data and is slower.
    # 20 is a good default for small datasets (< 10,000 users).
    N_FACTORS = 20

    def __init__(self) -> None:
        # TruncatedSVD: the "truncated" version only computes the top-k factors
        # (not all of them), which is much faster and works better on sparse data.
        # random_state=42: makes results reproducible ("42" is a convention in ML).
        self.svd = TruncatedSVD(n_components=self.N_FACTORS, random_state=42)

        # After training:
        self.user_factors: np.ndarray | None = None  # shape: (n_users,  k)
        self.gift_factors: np.ndarray | None = None  # shape: (n_gifts,  k)
        self.user_ids: list[str] = []
        self.gift_ids: list[str] = []

    # ──────────────────────────────────────────────────────────────────────────
    # TRAINING
    # ──────────────────────────────────────────────────────────────────────────

    def fit(self, swipes: list[dict]) -> None:
        """
        Build the user-item matrix and run SVD to find latent factors.

        Args:
            swipes: list of PocketBase swipe records
                    Each has: { "user": user_id, "gift": gift_id, "liked": bool }

        Steps:
          1. Convert raw swipes to a pandas DataFrame
          2. Map liked=True → +1.0, liked=False → -0.5 (asymmetric scoring)
          3. Pivot into (users × gifts) matrix, fill missing with 0
          4. Run TruncatedSVD to get U and V matrices
          5. Normalize both so we can use dot products instead of cosine sim
        """
        if not swipes:
            return  # No data → model stays untrained

        df = pd.DataFrame(swipes)

        # Rename PocketBase fields to our expected column names
        # PocketBase returns: "user" (the user relation ID), "gift" (gift relation ID)
        df = df.rename(columns={"user": "user_id", "gift": "gift_id"})

        # Convert boolean liked → numeric interaction score
        # Why -0.5 for dislikes instead of -1?
        # → Dislikes are a WEAKER signal than likes. If someone swipes left
        #   quickly they might just not want it right now, not hate it forever.
        # → Using -1 over-penalizes and can break recommendations for users
        #   who dislike many things in one category but like a few.
        df["score"] = df["liked"].map({True: 1.0, False: -0.5})

        # pivot_table: reshape from (n_swipes × 3 columns) to (n_users × n_gifts)
        # fill_value=0: unseen gifts get score 0 (neutral, not disliked)
        try:
            interaction_matrix = df.pivot_table(
                index="user_id",
                columns="gift_id",
                values="score",
                fill_value=0.0,
            )
        except Exception:
            return  # Malformed data → skip training

        self.user_ids = list(interaction_matrix.index)
        self.gift_ids = list(interaction_matrix.columns)

        matrix = interaction_matrix.values  # numpy array: (n_users, n_gifts)

        # SVD needs:
        #   rows ≥ 2          (at least 2 users)
        #   columns ≥ N_FACTORS (at least N_FACTORS gifts interacted with)
        # If we don't have enough data, skip SVD — the hybrid will use content-based only.
        if matrix.shape[0] < 2 or matrix.shape[1] < self.N_FACTORS:
            return

        # fit_transform runs SVD and returns U × Σ (the user coordinates in taste space)
        # components_ is Vᵀ — the gift coordinates
        self.user_factors = self.svd.fit_transform(matrix)  # (n_users, k)
        self.gift_factors = self.svd.components_.T          # (n_gifts, k)

        # L2 normalization: scale each vector to unit length.
        # After this, cosine_similarity(a, b) = dot_product(a, b)
        # → We can use fast matrix multiplication @ instead of calling cosine_similarity()
        self.user_factors = normalize(self.user_factors, norm="l2")
        self.gift_factors = normalize(self.gift_factors, norm="l2")

    # ──────────────────────────────────────────────────────────────────────────
    # INFERENCE
    # ──────────────────────────────────────────────────────────────────────────

    def score_gifts_for_user(
        self,
        user_id: str,
        exclude_ids: set[str],
    ) -> list[tuple[str, float]]:
        """
        Predict how much user_id will like each unseen gift.

        MATH:
          user_vec = self.user_factors[user_idx]   shape: (k,)
          gift_factors shape: (n_gifts, k)

          scores = gift_factors @ user_vec          shape: (n_gifts,)

          Because both are unit-normalized, this dot product IS cosine similarity.
          High score = gift is "close" to the user in taste space = recommend it.

        Returns [] if:
          - Model isn't trained yet (not enough data globally)
          - This user_id isn't in the training data (cold start)
          Callers (hybrid.py) handle this by falling back to content-based.
        """
        # Model not trained → no collaborative recommendations yet
        if self.user_factors is None or self.gift_factors is None:
            return []

        # User not in training data → cold start → caller uses content-based
        if user_id not in self.user_ids:
            return []

        user_idx = self.user_ids.index(user_id)
        user_vec = self.user_factors[user_idx]  # shape: (k,)

        # Matrix multiplication: one operation computes scores for ALL gifts at once
        # self.gift_factors shape: (n_gifts, k)
        # user_vec shape: (k,)
        # result shape: (n_gifts,)
        scores: np.ndarray = self.gift_factors @ user_vec

        results: list[tuple[str, float]] = []
        for idx, gift_id in enumerate(self.gift_ids):
            if gift_id not in exclude_ids:
                results.append((gift_id, float(scores[idx])))

        return sorted(results, key=lambda x: x[1], reverse=True)
