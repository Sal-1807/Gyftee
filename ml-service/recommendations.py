"""
recommendations.py — Hybrid Recommendation Engine for Gyftee

WHAT THIS MODULE DOES:
  Combines content-based and collaborative filtering into a single
  hybrid model that adapts its strategy based on how much data we have.

LESSONS COVERED:
  - The cold start problem
  - Hybrid recommendation strategies
  - Dynamic weight adjustment based on data availability
"""

from content_based import ContentBasedRecommender
from collaborative import CollaborativeFilteringRecommender


# =============================================================================
# LESSON 8: The Cold Start Problem
# =============================================================================
#
# "Cold start" means: what do we recommend to a BRAND NEW user who has
# never swiped anything?
#
# Content-based filtering: works fine! We just return a shuffled list
# of all gifts — no personalization yet, but at least it's not empty.
#
# Collaborative filtering: FAILS completely. The user has no interactions,
# so they don't exist in the user-item matrix. We can't find "users like them"
# because we have no data about them at all.
#
# This is a real problem for every recommendation system:
#   → Netflix: shows popular content to new users
#   → Spotify: asks about 3 artists you like on signup
#   → TikTok: shows viral content to everyone initially
#
# Our solution: dynamic weighting based on swipe count.
# =============================================================================

# =============================================================================
# LESSON 9: Hybrid Models — Combining Multiple Approaches
# =============================================================================
#
# Neither content-based nor collaborative filtering is perfect:
#
#   Content-based alone:
#     ✅ Works with zero history (cold start)
#     ❌ "Filter bubble": only recommends things similar to what you've already seen
#        → If you only liked keyboards, you'd only see more keyboards forever.
#        → You'd never discover yoga mats or cooking gear you might love.
#
#   Collaborative filtering alone:
#     ✅ Can surface surprising recommendations across category boundaries
#        → "Users like you" liked a yoga mat → maybe you would too?
#     ❌ Cold start: useless for new users
#     ❌ Needs lots of data to work well (sparse matrix problem)
#
#   Hybrid (what we build):
#     → Start with content-based (safe for cold start)
#     → Gradually add collaborative filtering as more data arrives
#     → Weight shifts automatically: more swipes = more collaborative influence
#
# Dynamic weight formula:
#   n_liked < 5:   content=1.0, collab=0.0  (cold start — pure content)
#   n_liked 5-20:  content=0.6, collab=0.4  (warming up)
#   n_liked > 20:  content=0.4, collab=0.6  (experienced user — trust collaborative more)
#
# WHY does collaborative get more weight with more data?
#   → With few likes, collaborative has too little information to be reliable.
#     Its recommendations would be noisy/random.
#   → With many likes, collaborative has identified "users like you" and
#     its cross-category suggestions become valuable.
# =============================================================================


class HybridRecommender:
    """
    Hybrid recommendation engine combining content-based and collaborative filtering.

    Attributes:
        content: ContentBasedRecommender — TF-IDF + cosine similarity
        collab:  CollaborativeFilteringRecommender — SVD matrix factorization
    """

    def __init__(self) -> None:
        self.content = ContentBasedRecommender()
        self.collab = CollaborativeFilteringRecommender()

    def fit(self, gifts: list[dict], swipes: list[dict]) -> None:
        """
        Train both sub-models.

        content.fit() builds the TF-IDF gift matrix.
        collab.fit()  builds the user-item matrix and runs SVD.

        Both are fast (<1 second for typical data sizes).
        Called once at server startup.
        """
        self.content.fit(gifts)
        self.collab.fit(swipes)

    def get_weights(self, n_liked: int) -> tuple[float, float]:
        """
        Compute content/collaborative weights based on swipe history size.

        Returns: (w_content, w_collab) — both sum to 1.0
        """
        if n_liked < 5:
            return 1.0, 0.0
        elif n_liked < 20:
            return 0.6, 0.4
        else:
            return 0.4, 0.6

    def recommend(
        self,
        user_id: str,
        liked_ids: list[str],
        disliked_ids: list[str],
        n: int = 20,
    ) -> list[str]:
        """
        Return top-n recommended gift IDs for user_id.

        ALGORITHM FLOW:
          1. Determine weights (content vs collaborative) based on swipe count
          2. Get content-based scores for all unseen gifts
          3. Get collaborative scores for all unseen gifts (may return empty)
          4. For each gift, compute: final_score = w_content×c + w_collab×k
          5. Sort by final_score descending, return top-n gift IDs

        COLD START HANDLING:
          If n_liked == 0 (new user), both models return minimal signal.
          Content-based returns near-zero similarity for all gifts (zero profile).
          We detect this and return a random shuffle instead of a useless ranking.

        Args:
            user_id:      PocketBase user ID
            liked_ids:    list of gift IDs the user liked
            disliked_ids: list of gift IDs the user disliked
            n:            how many recommendations to return
        """
        swiped_ids: set[str] = set(liked_ids + disliked_ids)
        n_liked = len(liked_ids)

        # ── Cold start: user has no swipe history → return empty ──────────────
        # The caller (main.py) handles cold start by fetching all gifts
        # and returning them shuffled. We signal cold start with empty list.
        if n_liked == 0 and len(disliked_ids) == 0:
            return []

        # ── Determine how much to trust each model ─────────────────────────────
        w_content, w_collab = self.get_weights(n_liked)

        # ── Content-based scores ───────────────────────────────────────────────
        user_profile = self.content.get_user_profile_vector(liked_ids, disliked_ids)
        # Returns: list of (gift_id, score) sorted best→worst
        content_score_list = self.content.score_gifts(user_profile, swiped_ids)
        content_scores: dict[str, float] = dict(content_score_list)

        # ── Collaborative scores ───────────────────────────────────────────────
        # Returns: [] if cold start or not enough data for this user
        collab_score_list = self.collab.score_gifts_for_user(user_id, swiped_ids)
        collab_scores: dict[str, float] = dict(collab_score_list)

        # ── Combine: weighted sum over all candidate gifts ─────────────────────
        # Union of both score sets (content scores every gift, collab may have a subset)
        all_candidate_ids = set(content_scores.keys()) | set(collab_scores.keys())

        combined: list[tuple[str, float]] = []
        for gift_id in all_candidate_ids:
            c_score = content_scores.get(gift_id, 0.0)
            k_score = collab_scores.get(gift_id, 0.0)

            # Weighted sum: how much each model contributes to the final score
            final_score = w_content * c_score + w_collab * k_score
            combined.append((gift_id, final_score))

        # ── Sort and return top-n ──────────────────────────────────────────────
        combined.sort(key=lambda x: x[1], reverse=True)
        return [gift_id for gift_id, _ in combined[:n]]
