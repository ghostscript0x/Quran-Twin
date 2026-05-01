import Redis from "ioredis";

const redis = process.env.REDIS_URL
  ? new Redis(process.env.REDIS_URL)
  : null;

const RATE_LIMIT_WINDOW = 15 * 60;
const RATE_LIMIT_MAX = 100;

export async function checkRateLimit(ip) {
  if (!redis) {
    return { allowed: true };
  }

  const key = `ratelimit:${ip}`;
  const current = await redis.incr(key);

  if (current === 1) {
    await redis.expire(key, RATE_LIMIT_WINDOW);
  }

  if (current > RATE_LIMIT_MAX) {
    return { allowed: false, remaining: 0, reset: RATE_LIMIT_WINDOW };
  }

  const ttl = await redis.ttl(key);
  return { allowed: true, remaining: RATE_LIMIT_MAX - current, reset: ttl };
}

export async function closeRateLimiter() {
  if (redis) {
    await redis.quit();
  }
}

export default redis;