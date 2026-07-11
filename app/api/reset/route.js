import { NextResponse } from 'next/server';
import { getRedis } from '../../../lib/redis';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  const key = new URL(request.url).searchParams.get('key');
  if (!process.env.RESET_KEY || key !== process.env.RESET_KEY) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }
  const redis = getRedis();
  if (!redis) {
    return NextResponse.json({ ok: false, error: 'no-redis' });
  }
  await redis.del('paradox:allais', 'paradox:ellsberg');
  return NextResponse.json({ ok: true, message: '집계가 초기화되었습니다.' });
}
