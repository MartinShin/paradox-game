import { Redis } from '@upstash/redis';

export function getRedis() {
  if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
    return null;
  }
  return Redis.fromEnv();
}

export const VALID = {
  allais: ['AC', 'AD', 'BC', 'BD'],
  ellsberg: ['II_II', 'II_I', 'I_II', 'I_I'],
};
