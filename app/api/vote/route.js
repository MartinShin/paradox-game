import { NextResponse } from 'next/server';
import { getRedis, VALID } from '../../../lib/redis';

export async function POST(request) {
  const body = await request.json().catch(() => null);
  const game = body?.game;
  const combo = body?.combo;
  if (!VALID[game] || !VALID[game].includes(combo)) {
    return NextResponse.json({ error: 'invalid' }, { status: 400 });
  }
  const redis = getRedis();
  if (!redis) {
    return NextResponse.json({ ok: false, stored: false });
  }
  const counts = await redis.hincrby(`paradox:${game}`, combo, 1).then(async () => {
    return await redis.hgetall(`paradox:${game}`);
  });
  return NextResponse.json({ ok: true, stored: true, counts: counts || {} });
}
