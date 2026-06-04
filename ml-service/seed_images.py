import os
import time
import requests
from pathlib import Path
from dotenv import load_dotenv

load_dotenv(Path(__file__).parent / ".env")
load_dotenv(Path(__file__).parent.parent / "gyftee" / ".env.local", override=False)

PB_URL = "http://127.0.0.1:8090"
ADMIN_EMAIL = os.getenv("POCKETBASE_ADMIN_EMAIL")
ADMIN_PASSWORD = os.getenv("POCKETBASE_ADMIN_PASSWORD")
UNSPLASH_KEY = os.getenv("UNSPLASH_ACCESS_KEY")

CONTENT_TYPE_EXT = {
    "image/jpeg": ".jpg",
    "image/png": ".png",
    "image/webp": ".webp",
    "image/gif": ".gif",
}


def pb_auth() -> str:
    resp = requests.post(
        f"{PB_URL}/api/admins/auth-with-password",
        json={"identity": ADMIN_EMAIL, "password": ADMIN_PASSWORD},
        timeout=10,
    )
    resp.raise_for_status()
    return resp.json()["token"]


def fetch_all_gifts(token: str) -> list[dict]:
    gifts = []
    page = 1
    per_page = 100
    auth = {"Authorization": f"Bearer {token}"}

    while True:
        resp = requests.get(
            f"{PB_URL}/api/collections/gifts/records",
            params={"page": page, "perPage": per_page},
            headers=auth,
            timeout=10,
        )
        resp.raise_for_status()
        data = resp.json()
        items = data.get("items", [])
        gifts.extend(items)
        if len(gifts) >= data["totalItems"]:
            break
        page += 1

    return gifts


def search_unsplash(query: str) -> str | None:
    resp = requests.get(
        "https://api.unsplash.com/search/photos",
        params={"query": query, "per_page": 1},
        headers={"Authorization": f"Client-ID {UNSPLASH_KEY}"},
        timeout=10,
    )
    resp.raise_for_status()
    results = resp.json().get("results", [])
    if not results:
        return None
    return results[0]["urls"]["regular"]


def download_image(url: str) -> tuple[bytes, str]:
    resp = requests.get(url, timeout=20)
    resp.raise_for_status()
    content_type = resp.headers.get("Content-Type", "image/jpeg").split(";")[0].strip()
    ext = CONTENT_TYPE_EXT.get(content_type, ".jpg")
    return resp.content, ext


def patch_gift_image(token: str, gift_id: str, image_bytes: bytes, ext: str) -> None:
    resp = requests.patch(
        f"{PB_URL}/api/collections/gifts/records/{gift_id}",
        files={"image": (f"image{ext}", image_bytes)},
        headers={"Authorization": f"Bearer {token}"},
        timeout=20,
    )
    resp.raise_for_status()


def main() -> None:
    if not ADMIN_EMAIL or not ADMIN_PASSWORD:
        raise SystemExit("POCKETBASE_ADMIN_EMAIL / POCKETBASE_ADMIN_PASSWORD not set in .env")
    if not UNSPLASH_KEY:
        raise SystemExit("UNSPLASH_ACCESS_KEY not set in .env")

    token = pb_auth()
    all_gifts = fetch_all_gifts(token)

    to_seed = [g for g in all_gifts if not g.get("image")]
    total = len(to_seed)
    seeded = 0

    for gift in to_seed:
        name = gift.get("name", "unknown")
        category = gift.get("category", "")
        gift_id = gift["id"]

        try:
            image_url = search_unsplash(f"{name} {category}")
            if not image_url:
                print(f"✗ {name} — no Unsplash results")
                time.sleep(1.5)
                continue

            image_bytes, ext = download_image(image_url)
            patch_gift_image(token, gift_id, image_bytes, ext)
            print(f"✓ {name}")
            seeded += 1

        except requests.HTTPError as e:
            print(f"✗ {name} — HTTP {e.response.status_code}: {e.response.text[:120]}")
        except Exception as e:
            print(f"✗ {name} — {e}")

        time.sleep(1.5)

    print(f"\n{seeded}/{total} images seeded successfully")


if __name__ == "__main__":
    main()
