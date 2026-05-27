"""
pocketbase_client.py — Async HTTP client for reading PocketBase data.

All functions use httpx (async HTTP library) to call the PocketBase REST API.
PocketBase exposes all collections at: /api/collections/{name}/records
"""

import os
import httpx
from dotenv import load_dotenv

load_dotenv()

PB_URL = os.getenv("POCKETBASE_URL", "http://127.0.0.1:8090")

# Shared async client with a reasonable timeout.
# We create it at module level so it's reused across requests (connection pooling).
_client = httpx.AsyncClient(timeout=10.0)


async def fetch_all_gifts() -> list[dict]:
    """
    Fetch all gifts from PocketBase.
    PocketBase paginates by default; perPage=500 gets everything in one call
    for typical catalog sizes.
    """
    resp = await _client.get(
        f"{PB_URL}/api/collections/gifts/records",
        params={"perPage": 500, "sort": "created"},
    )
    resp.raise_for_status()
    data = resp.json()
    return data.get("items", [])


async def fetch_all_swipes() -> list[dict]:
    """
    Fetch ALL swipes across ALL users — needed to build the global
    user-item interaction matrix for collaborative filtering.

    perPage=5000 handles up to 5,000 total swipes before needing pagination.
    For a portfolio app this is more than enough.
    """
    resp = await _client.get(
        f"{PB_URL}/api/collections/swipes/records",
        params={"perPage": 5000, "sort": "created"},
    )
    resp.raise_for_status()
    data = resp.json()
    return data.get("items", [])


async def fetch_user_swipes(user_id: str) -> list[dict]:
    """
    Fetch swipes for a specific user — used at inference time to get
    their liked/disliked gift IDs.

    PocketBase filter syntax: user="<id>"
    """
    resp = await _client.get(
        f"{PB_URL}/api/collections/swipes/records",
        params={
            "filter": f'user="{user_id}"',
            "perPage": 500,
            "sort": "-created",  # newest first
        },
    )
    resp.raise_for_status()
    data = resp.json()
    return data.get("items", [])
