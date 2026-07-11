import { createHash } from 'crypto';
import { NextResponse } from 'next/server';
import { getRedis } from '../../../lib/redis';

export const dynamic = 'force-dynamic';

// 키 원문은 저장소에 없음 - SHA-256 지문만 대조
const RESET_KEY_SHA256 = '1c5ce9d949be29a4e3a55c4c65626f371360c932da9d6f9cab93ef17f2ad4913';

export async function GET(request) {
  const key = new URL(request.url).searchParams.get('key') || '';
  const hash = createHash('sha256').update(key).digest('hex');
  if (hash !== RESET_KEY_SHA256) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }
  const redis = getRedis();
  if (!redis) {
    return NextResponse.json({ ok: false, error: 'no-redis' });
  }
  await redis.del('paradox:allais', 'paradox:ellsberg');
  return NextResponse.json({ ok: true, message: '집계가 초기화되었습니다.' });
}
