import { NextRequest, NextResponse } from 'next/server';
import PocketBase from 'pocketbase';

const ML_SERVICE_URL = process.env.ML_SERVICE_URL ?? 'http://127.0.0.1:8000';
const POCKETBASE_URL = process.env.NEXT_PUBLIC_POCKETBASE_URL ?? 'http://127.0.0.1:8090';
const INTERNAL_API_TOKEN = process.env.INTERNAL_API_TOKEN ?? '';

/** Neutral response used whenever the ML service can't be reached or refuses us. */
function fallbackResponse() {
  return NextResponse.json(
    { gift_ids: [], model_weights: {}, user_swipe_count: 0, fallback: true },
    { status: 200 }
  );
}

/**
 * Resolve the caller's PocketBase user id from the pb_auth cookie.
 *
 * Returns null for anything that isn't a live, server-verified session.
 */
async function getAuthenticatedUserId(req: NextRequest): Promise<string | null> {
  const cookieHeader = req.headers.get('cookie');
  if (!cookieHeader) return null;

  // A fresh client per request. The exported singleton in lib/pocketbase.ts is
  // module-scoped, so writing auth state onto it here would leak one caller's
  // session into another concurrent request on the same warm instance.
  const client = new PocketBase(POCKETBASE_URL);

  // Parses the cookie only — it does NOT verify the token (per the SDK docs).
  client.authStore.loadFromCookie(cookieHeader);
  if (!client.authStore.isValid) return null;

  try {
    // The actual verification: PocketBase checks the signature server-side and
    // returns the record the token belongs to. We take the id from that record
    // rather than from anything the client told us. The rotated token in the
    // response is intentionally discarded so the browser's own authStore stays
    // in sync.
    await client.collection('users').authRefresh({ requestKey: null });
  } catch {
    return null;
  }

  return client.authStore.record?.id ?? null;
}

export async function POST(req: NextRequest) {
  const userId = await getAuthenticatedUserId(req);
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let n = 20;
  let interests: string[] = [];
  try {
    const body = await req.json();
    // body.userId is deliberately not read. The user id always comes from the
    // verified session above, so a caller cannot request another user's deck.
    if (typeof body?.n === 'number') n = Math.min(Math.max(Math.trunc(body.n), 1), 100);
    if (Array.isArray(body?.interests)) {
      interests = body.interests.filter((i: unknown): i is string => typeof i === 'string');
    }
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  try {
    const res = await fetch(`${ML_SERVICE_URL}/recommendations`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Internal-Token': INTERNAL_API_TOKEN,
      },
      body: JSON.stringify({ user_id: userId, n, interests }),
      signal: AbortSignal.timeout(5000),
    });

    if (res.status === 401 || res.status === 403) {
      // The shared secret is missing or mismatched between this app and the ML
      // service. Without this log the symptom is invisible: recommendations
      // would just silently degrade to the fallback deck.
      console.error(
        `[recommendations] ML service rejected the internal token (HTTP ${res.status}) — check INTERNAL_API_TOKEN`
      );
      return fallbackResponse();
    }

    if (!res.ok) throw new Error(`ML service error: ${res.status}`);
    return NextResponse.json(await res.json());
  } catch {
    return fallbackResponse();
  }
}
