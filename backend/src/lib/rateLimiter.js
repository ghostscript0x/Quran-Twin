const rateLimitStore = new Map();

const RATE_LIMIT_WINDOW = 15 * 60;
const RATE_LIMIT_MAX = 100;
const CLEANUP_INTERVAL = 60 * 1000;

setInterval(() => {
  const now = Date.now();
  for (const [key, data] of rateLimitStore.entries()) {
    if (now > data.resetAt) {
      rateLimitStore.delete(key);
    }
  }
}, CLEANUP_INTERVAL);

export async function checkRateLimit(ip) {
  const key = `ratelimit:${ip}`;
  const now = Date.now();
  
  let record = rateLimitStore.get(key);
  
  if (!record || now > record.resetAt) {
    rateLimitStore.set(key, {
      count: 1,
      resetAt: now + (RATE_LIMIT_WINDOW * 1000)
    });
    return { 
      allowed: true, 
      remaining: RATE_LIMIT_MAX - 1, 
      reset: RATE_LIMIT_WINDOW 
    };
  }
  
  record.count++;
  
  if (record.count > RATE_LIMIT_MAX) {
    return { 
      allowed: false, 
      remaining: 0, 
      reset: Math.ceil((record.resetAt - now) / 1000) 
    };
  }
  
  const ttl = Math.ceil((record.resetAt - now) / 1000);
  return { 
    allowed: true, 
    remaining: RATE_LIMIT_MAX - record.count, 
    reset: ttl 
  };
}

export async function closeRateLimiter() {
  rateLimitStore.clear();
}

export default { checkRateLimit, closeRateLimiter };