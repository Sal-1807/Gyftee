import PocketBase from 'pocketbase';
import type { TypedPocketBase } from '@/types/pocketbase.types';

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
