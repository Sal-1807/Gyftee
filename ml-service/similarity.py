"""
similarity.py — Educational vector math utilities for Gyftee ML service.

This file exists purely to teach the foundational math behind every ML
recommendation algorithm. Read it top-to-bottom like a lesson.
"""

import numpy as np
from sklearn.metrics.pairwise import cosine_similarity as sklearn_cosine

# =============================================================================
# LESSON 1: What is a Vector?
# =============================================================================
#
# Machine learning cannot work directly with words like "keyboard" or "yoga mat".
# It needs NUMBERS. A vector is simply a list of numbers that represents
# something in a mathematical way.
#
# Imagine we have a vocabulary of tags across all our gifts:
#   position: [desk, gaming, rgb, outdoor, fitness, mechanical, wireless]
#
# We can represent a gift as a binary vector:
#   "Mechanical Keyboard" → [1, 1, 1, 0, 0, 1, 0]
#                             desk gaming rgb outdoor fitness mech wireless
#   "Yoga Mat"            → [0, 0, 0, 1, 1, 0, 0]
#   "Wireless Headphones" → [0, 1, 0, 0, 0, 0, 1]
#
# Now we can do MATH on gifts — measure distances, compute averages,
# find the "center of gravity" of a user's taste.
# =============================================================================

# =============================================================================
# LESSON 2: Cosine Similarity
# =============================================================================
#
# Given two vectors (two gifts), how do we measure how SIMILAR they are?
#
# Option A: Euclidean distance (straight-line distance) — bad for sparse data
# Option B: Cosine similarity — measures the ANGLE between two vectors
#
# Imagine each vector as an ARROW pointing in multi-dimensional space.
# Two similar gifts point in roughly the SAME DIRECTION.
#
#   Angle = 0°   → cos(0)   = 1.0  → identical
#   Angle = 90°  → cos(90)  = 0.0  → nothing in common
#   Angle = 180° → cos(180) = -1.0 → perfect opposites
#
# Formula:
#   cosine_similarity(A, B) = (A · B) / (||A|| × ||B||)
#
#   A · B  = dot product = sum of (a_i × b_i) for each dimension i
#   ||A||  = magnitude (length) of A = sqrt(sum of a_i²)
#
# WHY cosine and not Euclidean?
#   Cosine ignores magnitude (length) and only cares about direction.
#   A keyboard with 5 tags and a keyboard with 2 tags both point in the same
#   "keyboard direction" — cosine handles this correctly; Euclidean doesn't.
# =============================================================================


def cosine_similarity_manual(vec_a: list[float], vec_b: list[float]) -> float:
    """
    Manual cosine similarity implementation — for learning.

    This is mathematically identical to sklearn's version.
    We implement it manually so you can trace through every step.

    In production code we use sklearn's vectorized version (1000x faster),
    but understanding the manual version is the real insight.
    """
    a = np.array(vec_a, dtype=float)
    b = np.array(vec_b, dtype=float)

    # Step 1: dot product (A · B)
    # Multiply element-by-element, then sum everything up
    dot_product = np.dot(a, b)

    # Step 2: magnitudes (||A|| and ||B||)
    # np.linalg.norm computes sqrt(sum of squares) = Euclidean length of the vector
    magnitude_a = np.linalg.norm(a)
    magnitude_b = np.linalg.norm(b)

    # Step 3: guard against division by zero
    # A zero vector has no direction — similarity is undefined, return 0
    if magnitude_a == 0 or magnitude_b == 0:
        return 0.0

    # Step 4: cosine similarity = dot / (||a|| × ||b||)
    return float(dot_product / (magnitude_a * magnitude_b))


def batch_cosine_similarity(
    query_vector: np.ndarray, matrix: np.ndarray
) -> np.ndarray:
    """
    Compute cosine similarity between ONE query vector and MANY vectors at once.

    Instead of looping and calling cosine_similarity_manual N times,
    we pass the entire matrix to sklearn and get all scores in one call.

    WHY is this faster?
    → numpy/sklearn operations run in C under the hood (not Python).
    → On a modern CPU, computing 50,000 similarities takes ~5ms this way
      vs ~5 seconds with a Python loop.

    This "vectorized" style of thinking — operating on arrays instead of
    individual elements — is a core ML engineering skill.

    Args:
        query_vector: shape (n_features,)
        matrix:       shape (n_items, n_features)

    Returns:
        scores:       shape (n_items,) — similarity to each item
    """
    # sklearn expects 2D input, so we reshape (n_features,) → (1, n_features)
    # Then squeeze (1, n_items) → (n_items,) for convenient output
    return sklearn_cosine(query_vector.reshape(1, -1), matrix).squeeze()


# =============================================================================
# LESSON 3: Why Normalize Vectors?
# =============================================================================
#
# When we normalize a vector, we scale it so its length (magnitude) = 1.
# These are called "unit vectors."
#
# After normalization: cosine_similarity(A, B) = dot_product(A, B)
# The denominator (||A|| × ||B||) becomes (1 × 1) = 1, so it disappears.
#
# Why does this matter?
#   → Dot products are faster to compute than full cosine similarity
#   → Matrix multiplication (@) computes all dot products in one shot
#   → We use this trick in the collaborative filtering module
# =============================================================================


def normalize_vectors(matrix: np.ndarray) -> np.ndarray:
    """
    Scale each row vector to unit length (L2 normalization).

    After normalization, cosine similarity equals the dot product,
    which allows us to use fast matrix multiplication for recommendations.

    Args:
        matrix: shape (n, d) — n vectors of dimension d

    Returns:
        normalized: shape (n, d) — each row has magnitude 1.0
    """
    from sklearn.preprocessing import normalize
    return normalize(matrix, norm="l2")


# =============================================================================
# Example / Demo (runs only when this file is executed directly)
# =============================================================================

if __name__ == "__main__":
    print("=== Cosine Similarity Demo ===\n")

    keyboard = [1, 1, 1, 0, 0, 1, 0]  # desk, gaming, rgb, mechanical
    mouse    = [1, 1, 0, 0, 0, 0, 1]  # desk, gaming, wireless
    yoga_mat = [0, 0, 0, 1, 1, 0, 0]  # outdoor, fitness

    print(f"keyboard vs mouse:    {cosine_similarity_manual(keyboard, mouse):.3f}")
    print(f"keyboard vs yoga_mat: {cosine_similarity_manual(keyboard, yoga_mat):.3f}")
    print(f"keyboard vs keyboard: {cosine_similarity_manual(keyboard, keyboard):.3f}")
    print()
    print("Expected: keyboard≈mouse (similar category), keyboard≠yoga_mat (different)")
