"""
content_based.py — TF-IDF Content-Based Recommendation Engine

WHAT THIS MODULE DOES:
  Answers the question: "Given what a user has liked so far, which gifts
  have the most similar features?"

LESSONS COVERED:
  - TF-IDF (how ML turns text/tags into numbers)
  - Building a user taste profile vector
  - Cosine similarity scoring against a full gift catalog
"""

import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity


# =============================================================================
# LESSON 4: TF-IDF — Turning Text into Numbers
# =============================================================================
#
# Our gifts have tags: ["desk", "rgb", "mechanical", "gaming", "keyboard"]
# We need to turn these into numbers so ML math can work on them.
#
# The naive approach: count how many times each word appears.
# Problem: common words like "gaming" appear in 30 of 50 gifts.
#          They don't tell us much about what makes a gift UNIQUE.
#
# TF-IDF (Term Frequency - Inverse Document Frequency) solves this:
#
#   TF  (Term Frequency):
#     How often does this tag appear in THIS gift?
#     A gift with 5 mentions of "mechanical" cares a LOT about "mechanical."
#
#   IDF (Inverse Document Frequency):
#     How RARE is this tag across ALL gifts?
#     IDF = log(total_gifts / gifts_containing_this_tag)
#
#     "gaming" in 30/50 gifts → IDF = log(50/30) = 0.51  (common, low weight)
#     "artisan-keycap" in 2/50 gifts → IDF = log(50/2) = 3.22 (rare, high weight)
#
#   Final score = TF × IDF
#
#   Result: rare, specific tags get high scores and dominate the similarity math.
#           Common tags become low-weight background noise.
#
# After running TF-IDF on all gifts, we get a MATRIX:
#   Rows    = gifts (one row per gift)
#   Columns = unique tags/words across all gifts
#   Values  = TF-IDF score for that tag in that gift
#
# This is called the "feature matrix" or "item matrix."
# =============================================================================


class ContentBasedRecommender:
    """
    Content-based recommendation engine.

    Workflow:
      1. fit(gifts)          — build TF-IDF matrix from gift catalog
      2. get_user_profile()  — average the vectors of gifts the user liked
      3. score_gifts()       — rank all unseen gifts by cosine similarity to profile

    "Content-based" means we only look at ITEM FEATURES (tags, category).
    We don't look at what other users did — that's collaborative filtering.
    """

    def __init__(self) -> None:
        self.tfidf = TfidfVectorizer(
            # analyzer='word': split on spaces, treat each word as a feature
            analyzer="word",
            # ngram_range=(1,2): consider single words AND consecutive pairs
            # "noise cancelling" as a pair is more specific than "noise" + "cancelling" separately
            ngram_range=(1, 2),
            # min_df=1: include tags that appear in at least 1 gift (keep everything)
            min_df=1,
            # max_df=0.8: ignore tags that appear in >80% of gifts (too common to be useful)
            max_df=0.8,
        )
        # gift_matrix shape: (n_gifts, n_vocabulary_words)
        # Each row is one gift's TF-IDF vector
        self.gift_matrix: np.ndarray | None = None
        self.gift_ids: list[str] = []

    # ──────────────────────────────────────────────────────────────────────────
    # TRAINING (runs once at server startup)
    # ──────────────────────────────────────────────────────────────────────────

    def fit(self, gifts: list[dict]) -> None:
        """
        Build the TF-IDF feature matrix from the full gift catalog.

        This is the "training" step for content-based filtering.
        We run it once at server startup; it takes < 50ms for 500 gifts.

        Each gift is converted to a single text string:
          tags   = ["desk", "rgb", "mechanical"]
          text   = "Tech Tech Tech desk rgb mechanical"
                    ^^^--- category repeated 3x to give it more weight

        Why repeat category?
          TF = frequency. Repeating 3x makes TF=3 for "Tech", vs TF=1 for tags.
          This makes the category a stronger signal in the similarity math.
        """
        if not gifts:
            return

        tag_strings: list[str] = []
        for gift in gifts:
            tags: list[str] = gift.get("tags", [])
            if isinstance(tags, str):
                # PocketBase sometimes returns JSON as a string — handle both
                import json
                try:
                    tags = json.loads(tags)
                except Exception:
                    tags = []

            category: str = gift.get("category", "")
            # Repeat category 3× for higher TF weight
            text = f"{category} {category} {category} " + " ".join(tags)
            tag_strings.append(text)

        self.gift_ids = [g["id"] for g in gifts]

        # fit_transform does two things in one call:
        #   fit:      learns the vocabulary (all unique words across all gifts)
        #   transform: computes TF-IDF scores for each gift
        # Returns a sparse matrix; .toarray() converts to dense numpy array
        self.gift_matrix = self.tfidf.fit_transform(tag_strings).toarray()

    # ──────────────────────────────────────────────────────────────────────────
    # INFERENCE (runs per-request)
    # ──────────────────────────────────────────────────────────────────────────

    def get_user_profile_vector(
        self,
        liked_gift_ids: list[str],
        disliked_gift_ids: list[str],
    ) -> np.ndarray:
        """
        Build a single "taste vector" that summarizes what the user likes.

        ALGORITHM:
          1. Look up the TF-IDF vectors for all gifts the user LIKED
          2. Average them → "center of gravity" of liked gifts
          3. Subtract 30% of the average of DISLIKED gift vectors
             → Pulls the profile away from things the user hated

        This "positive minus negative" approach is borrowed from how
        Word2Vec and doc embeddings handle sentiment.

        Returns shape: (n_vocabulary_words,)
          → Same shape as a single row in gift_matrix, so we can compare them.
        """
        if self.gift_matrix is None:
            raise RuntimeError("Call fit() before get_user_profile_vector()")

        # Map gift_id → row index in self.gift_matrix
        id_to_idx = {gid: i for i, gid in enumerate(self.gift_ids)}

        liked_vectors = [
            self.gift_matrix[id_to_idx[gid]]
            for gid in liked_gift_ids
            if gid in id_to_idx
        ]
        disliked_vectors = [
            self.gift_matrix[id_to_idx[gid]]
            for gid in disliked_gift_ids
            if gid in id_to_idx
        ]

        # Cold start: user hasn't liked anything yet
        # Return a zero vector — when compared via cosine similarity,
        # a zero vector gives 0.0 similarity to everything (neutral baseline)
        if not liked_vectors:
            return np.zeros(self.gift_matrix.shape[1])

        liked_avg = np.mean(liked_vectors, axis=0)

        if disliked_vectors:
            disliked_avg = np.mean(disliked_vectors, axis=0)
            # 30% dislike penalty: dislikes matter, but less than likes.
            # If we used 100% it would over-penalize edge cases.
            profile = liked_avg - 0.3 * disliked_avg
        else:
            profile = liked_avg

        return profile

    def score_gifts(
        self,
        user_profile: np.ndarray,
        exclude_ids: set[str],
    ) -> list[tuple[str, float]]:
        """
        Score every gift in the catalog by cosine similarity to the user profile.

        WHAT HAPPENS HERE:
          We have:
            user_profile shape: (1, n_features)  ← the user's taste as a vector
            gift_matrix  shape: (n_gifts, n_features) ← every gift as a vector

          cosine_similarity(user_profile, gift_matrix) computes similarity
          between the user and EVERY gift in ONE matrix operation.

          Result shape: (n_gifts,) — one score per gift.

        Returns: list of (gift_id, score) sorted best → worst,
                 excluding gifts the user already swiped.
        """
        if self.gift_matrix is None:
            raise RuntimeError("Call fit() first")

        # cosine_similarity expects 2D inputs
        scores: np.ndarray = cosine_similarity(
            user_profile.reshape(1, -1),  # (1, n_features)
            self.gift_matrix,             # (n_gifts, n_features)
        ).squeeze()                       # → (n_gifts,)

        results: list[tuple[str, float]] = []
        for idx, gift_id in enumerate(self.gift_ids):
            if gift_id not in exclude_ids:
                results.append((gift_id, float(scores[idx])))

        # Best recommendations first
        return sorted(results, key=lambda x: x[1], reverse=True)
