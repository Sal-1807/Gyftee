import { NextRequest, NextResponse } from 'next/server';

const ML_SERVICE_URL = process.env.ML_SERVICE_URL ?? 'http://127.0.0.1:8000';

export async function POST(req: NextRequest) {
  const { userId, n = 20 } = await req.json();

  if (!userId) {
    return NextResponse.json({ error: 'userId required' }, { status: 400 });
  }

  try {
    const res = await fetch(`${ML_SERVICE_URL}/recommendations`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_id: userId, n }),
      signal: AbortSignal.timeout(5000),
    });

    if (!res.ok) throw new Error(`ML service error: ${res.status}`);
    const data = await res.json();
    return NextResponse.json(data);
  } catch {
    return NextResponse.json(
      { gift_ids: [], model_weights: {}, user_swipe_count: 0, fallback: true },
      { status: 200 }
    );
  }
}
