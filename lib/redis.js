import { Redis } from '@upstash/redis';

export function getRedis() {
  // Vercel 마켓플레이스(Upstash) 연결 시 주입되는 이름이 환경에 따라 다르므로 둘 다 지원
  const url = process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN;
  if (!url || !token) {
    return null;
  }
  return new Redis({ url, token });
}

export const VALID = {
  allais: ['AC', 'AD', 'BC', 'BD'],
  ellsberg: ['II_II', 'II_I', 'I_II', 'I_I'],
};
