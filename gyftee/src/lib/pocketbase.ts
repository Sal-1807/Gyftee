import PocketBase from 'pocketbase';
import type { TypedPocketBase } from '@/types/pocketbase.types';

// crypto.randomUUID is only available in secure contexts (HTTPS).
// Polyfill for local dev over HTTP on mobile.
if (typeof window !== 'undefined' && !crypto.randomUUID) {
  (crypto as any).randomUUID = () =>
    '10000000-1000-4000-8000-100000000000'.replace(/[018]/g, (c: string) =>
      (+c ^ (crypto.getRandomValues(new Uint8Array(1))[0] & (15 >> (+c / 4)))).toString(16)
    );
}

let _pb: TypedPocketBase | undefined;

function getPocketBase(): TypedPocketBase {
  if (!_pb) {
    _pb = new PocketBase(
      process.env.NEXT_PUBLIC_POCKETBASE_URL ?? 'http://127.0.0.1:8090'
    ) as TypedPocketBase;

    // Only load auth from cookie in the browser — localStorage isn't available on the server
    if (typeof window !== 'undefined') {
      _pb.authStore.loadFromCookie(document.cookie);
    }
  }
  return _pb;
}

export const pb = getPocketBase();
export default getPocketBase;
