import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Memory-bounded rate limiter with automatic eviction to prevent memory exhaustion
const rateLimitMap = new Map<string, { count: number; lastReset: number }>();
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const MAX_REQUESTS_PER_WINDOW = 120; // 120 requests per minute per IP for general APIs
const MAX_CHECKOUT_REQUESTS = 20; // 20 requests per minute for checkout/orders
const MAX_TRACKED_IPS = 10000;

function cleanupRateLimitMap(now: number) {
  if (rateLimitMap.size > MAX_TRACKED_IPS) {
    for (const [key, value] of rateLimitMap.entries()) {
      if (now - value.lastReset > RATE_LIMIT_WINDOW) {
        rateLimitMap.delete(key);
      }
    }
  }
}

export function proxy(req: NextRequest) {
  const rawIp = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || '127.0.0.1';
  const ip = rawIp.split(',')[0].trim() || '127.0.0.1';
  const path = req.nextUrl.pathname;
  const now = Date.now();

  cleanupRateLimitMap(now);

  // 1. Firewall & Rate Limiting Check
  const clientLimit = rateLimitMap.get(ip) || { count: 0, lastReset: now };

  if (now - clientLimit.lastReset > RATE_LIMIT_WINDOW) {
    clientLimit.count = 1;
    clientLimit.lastReset = now;
  } else {
    clientLimit.count++;
  }
  rateLimitMap.set(ip, clientLimit);

  const limitThreshold = path.startsWith('/api/orders') ? MAX_CHECKOUT_REQUESTS : MAX_REQUESTS_PER_WINDOW;

  if (clientLimit.count > limitThreshold) {
    return NextResponse.json(
      { error: 'Firewall Alert: Rate limit exceeded. Too many requests from this IP address.' },
      { status: 429, headers: { 'Retry-After': '60' } }
    );
  }

  // 2. Sensitive Information & Header Protection
  const response = NextResponse.next();
  response.headers.set('X-StarFashion-Security', 'Active-Enterprise-Defense');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'SAMEORIGIN');

  return response;
}

export const config = {
  matcher: ['/api/:path*', '/checkout/:path*'],
};
