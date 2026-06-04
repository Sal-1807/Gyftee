"""
pocketbase_client.py — Async HTTP client for reading PocketBase data.

All functions use httpx (async HTTP library) to call the PocketBase REST API.
PocketBase exposes all collections at: /api/collections/{name}/records

The swipes collection requires admin auth (@request.auth.id != "").
We authenticate lazily on the first swipe request and cache the token.
On a 401 we re-authenticate once and retry (handles token expiry).
"""

import os
import httpx
from dotenv import load_dotenv

load_dotenv()

PB_URL = os.getenv("POCKETBASE_URL", "http://127.0.0.1:8090")

# Shared async client with a reasonable timeout.
# We create it at module level so it's reused across requests (connection pooling).
_client = httpx.AsyncClient(timeout=10.0)

_admin_token: str | None = None


async def _authenticate() -> None:
    """Fetch a fresh admin token and cache it in _admin_token."""
    global _admin_token
    email = os.getenv("POCKETBASE_ADMIN_EMAIL", "")
    password = os.getenv("POCKETBASE_ADMIN_PASSWORD", "")
    resp = await _client.post(
        f"{PB_URL}/api/admins/auth-with-password",
        json={"identity": email, "password": password},
    )
    resp.raise_for_status()
    _admin_token = resp.json()["token"]


async def _auth_headers() -> dict[str, str]:
    """Return Authorization header, authenticating lazily if needed."""
    global _admin_token
    if not _admin_token:
        await _authenticate()
    return {"Authorization": f"Bearer {_admin_token}"}


async def _authed_get(url: str, params: dict | None = None) -> httpx.Response:
    """GET with admin auth. Retries once on 401 to handle token expiry."""
    resp = await _client.get(url, params=params, headers=await _auth_headers())
    if resp.status_code == 401:
        await _authenticate()
        resp = await _client.get(url, params=params, headers=await _auth_headers())
    return resp


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
    resp = await _authed_get(
        f"{PB_URL}/api/collections/swipes/records",
        params={"perPage": 5000, "sort": "created"},
    )
    print(f"[DEBUG] Swipes URL: {PB_URL}/api/collections/swipes/records")
    print(f"[DEBUG] Status: {resp.status_code}")
    print(f"[DEBUG] Response: {resp.text[:500]}")
    print(f"[DEBUG] Token (first 20): {_admin_token[:20] if _admin_token else 'None'}")
    resp.raise_for_status()
    return resp.json().get("items", [])


async def fetch_user_swipes(user_id: str) -> list[dict]:
    """
    Fetch swipes for a specific user — used at inference time to get
    their liked/disliked gift IDs.

    PocketBase filter syntax: user="<id>"
    """
    resp = await _authed_get(
        f"{PB_URL}/api/collections/swipes/records",
        params={
            "filter": f'user="{user_id}"',
            "perPage": 500,
            "sort": "-created",  # newest first
        },
    )
    resp.raise_for_status()
    return resp.json().get("items", [])
