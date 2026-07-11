import { NextResponse } from 'next/server';
import { getRedis } from '../../../lib/redis';

export const dynamic = 'force-dynamic';

export async function GET() {
  const redis = getRedis();
  if (!redis) {
    return NextResponse.json({ allais: {}, ellsberg: {} });
  }
  const [allais, ellsberg] = await Promise.all([
    redis.hgetall('paradox:allais'),
    redis.hgetall('paradox:ellsberg'),
  ]);
  return NextResponse.json({ allais: allais || {}, ellsberg: ellsberg || {} });
}
