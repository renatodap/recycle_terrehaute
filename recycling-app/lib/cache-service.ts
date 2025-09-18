import { LRUCache } from 'lru-cache';
import crypto from 'crypto';

// Define cache entry type
interface CacheEntry {
  result: any;
  timestamp: number;
}

// Initialize LRU cache
const cache = new LRUCache<string, CacheEntry>({
  max: 100, // Maximum 100 items
  ttl: 1000 * 60 * 60, // 1 hour TTL
  updateAgeOnGet: true,
  updateAgeOnHas: false,
});

// Rate limiting storage
interface RateLimitEntry {
  count: number;
  resetTime: number;
}

const rateLimits = new Map<string, RateLimitEntry>();

// Generate cache key from image
export function generateCacheKey(imageBase64: string): string {
  return crypto
    .createHash('md5')
    .update(imageBase64.substring(0, 1000)) // Use first 1000 chars for performance
    .digest('hex');
}

// Get cached result
export function getCachedResult(key: string): any | null {
  const entry = cache.get(key);

  if (entry) {
    console.log(`Cache hit for key: ${key}`);
    return entry.result;
  }

  return null;
}

// Set cached result
export function setCachedResult(key: string, result: any): void {
  cache.set(key, {
    result,
    timestamp: Date.now(),
  });
  console.log(`Cached result for key: ${key}`);
}

// Clear cache
export function clearCache(): void {
  cache.clear();
  console.log('Cache cleared');
}

// Get cache statistics
export function getCacheStats() {
  return {
    size: cache.size,
    maxSize: cache.max,
    calculatedSize: cache.calculatedSize,
  };
}

// Rate limiting functions
export interface RateLimitConfig {
  maxRequests: number;
  windowMs: number;
}

// Check rate limit for a client
export function checkRateLimit(
  clientId: string,
  config: RateLimitConfig = { maxRequests: 10, windowMs: 60000 }
): { allowed: boolean; remaining: number; resetTime: Date } {
  const now = Date.now();
  const entry = rateLimits.get(clientId);

  // Clean up old entries
  if (entry && entry.resetTime < now) {
    rateLimits.delete(clientId);
  }

  // Get or create rate limit entry
  let currentEntry = rateLimits.get(clientId);

  if (!currentEntry) {
    currentEntry = {
      count: 0,
      resetTime: now + config.windowMs,
    };
    rateLimits.set(clientId, currentEntry);
  }

  // Check if limit exceeded
  const allowed = currentEntry.count < config.maxRequests;
  const remaining = Math.max(0, config.maxRequests - currentEntry.count);
  const resetTime = new Date(currentEntry.resetTime);

  // Increment count if allowed
  if (allowed) {
    currentEntry.count++;
  }

  return { allowed, remaining, resetTime };
}

// Reset rate limit for a client
export function resetRateLimit(clientId: string): void {
  rateLimits.delete(clientId);
}

// Get all rate limit entries (for debugging)
export function getRateLimitStats() {
  const stats: any[] = [];

  rateLimits.forEach((value, key) => {
    stats.push({
      clientId: key,
      count: value.count,
      resetTime: new Date(value.resetTime),
    });
  });

  return stats;
}

// Daily API limit tracking
interface DailyLimitEntry {
  count: number;
  date: string;
}

const dailyLimits = new Map<string, DailyLimitEntry>();

// Check daily API limit
export function checkDailyLimit(
  clientId: string,
  maxDaily: number = 1000
): { allowed: boolean; used: number; remaining: number; resetTime: Date } {
  const today = new Date().toDateString();
  const entry = dailyLimits.get(clientId);

  // Reset if new day
  if (entry && entry.date !== today) {
    dailyLimits.delete(clientId);
  }

  // Get or create daily limit entry
  let currentEntry = dailyLimits.get(clientId);

  if (!currentEntry) {
    currentEntry = {
      count: 0,
      date: today,
    };
    dailyLimits.set(clientId, currentEntry);
  }

  // Check if limit exceeded
  const allowed = currentEntry.count < maxDaily;
  const remaining = Math.max(0, maxDaily - currentEntry.count);

  // Calculate reset time (next day at midnight)
  const resetTime = new Date();
  resetTime.setDate(resetTime.getDate() + 1);
  resetTime.setHours(0, 0, 0, 0);

  // Increment count if allowed
  if (allowed) {
    currentEntry.count++;
  }

  return {
    allowed,
    used: currentEntry.count,
    remaining,
    resetTime,
  };
}

// Clean up expired entries periodically
setInterval(() => {
  const now = Date.now();

  // Clean up rate limits
  rateLimits.forEach((value, key) => {
    if (value.resetTime < now) {
      rateLimits.delete(key);
    }
  });

  // Clean up old daily limits
  const today = new Date().toDateString();
  dailyLimits.forEach((value, key) => {
    if (value.date !== today) {
      dailyLimits.delete(key);
    }
  });
}, 60000); // Run every minute

// Export cache and rate limit stats for monitoring
export function getSystemStats() {
  return {
    cache: getCacheStats(),
    rateLimits: {
      activeClients: rateLimits.size,
      entries: getRateLimitStats(),
    },
    dailyLimits: {
      activeClients: dailyLimits.size,
      entries: Array.from(dailyLimits.entries()).map(([key, value]) => ({
        clientId: key,
        count: value.count,
        date: value.date,
      })),
    },
  };
}