import { NextResponse } from 'next/server';
import { getClientIp, isRateLimited } from '@/lib/rateLimit';
import { decodeHeader, describeUserAgent, isBot, sheetSafe, type VisitRow } from '@/lib/visitor';

/**
 * Visitor log. The page calls this once per browser session; each real visit
 * becomes one row in a Google Sheet (see docs/visitor-log.md).
 *
 * Set VISITOR_SHEET_URL to the sheet's Apps Script web-app URL. It is a
 * server-only variable, so the URL is never sent to the browser. Without it,
 * nothing is stored.
 */

const SHEET_URL = process.env.VISITOR_SHEET_URL;
/** The same visitor is logged at most once in this window, per server instance. */
const REPEAT_WINDOW_MS = 30 * 60 * 1000;
const SHEET_TIMEOUT_MS = 5000;

const recentVisitors = new Map<string, number>();

function seenRecently(key: string): boolean {
  const now = Date.now();
  if (recentVisitors.size > 5000) {
    for (const [k, at] of recentVisitors) if (now - at > REPEAT_WINDOW_MS) recentVisitors.delete(k);
  }
  const last = recentVisitors.get(key);
  if (last !== undefined && now - last < REPEAT_WINDOW_MS) return true;
  recentVisitors.set(key, now);
  return false;
}

const noContent = () => new NextResponse(null, { status: 204 });

export async function POST(request: Request) {
  try {
    const userAgent = request.headers.get('user-agent') ?? '';
    if (isBot(userAgent)) return noContent();

    const ip = getClientIp(request);
    if (isRateLimited(`visit:${ip}`) || seenRecently(`${ip}|${userAgent}`)) return noContent();

    const body: unknown = await request.json().catch(() => null);
    const data = typeof body === 'object' && body !== null ? (body as Record<string, unknown>) : {};
    const { device, os, browser } = describeUserAgent(userAgent);

    const row: VisitRow = {
      time: new Date().toISOString(),
      ip: sheetSafe(ip, 60),
      city: sheetSafe(decodeHeader(request.headers.get('x-vercel-ip-city')), 80),
      region: sheetSafe(request.headers.get('x-vercel-ip-country-region'), 20),
      country: sheetSafe(request.headers.get('x-vercel-ip-country'), 8),
      device,
      os,
      browser,
      referrer: sheetSafe(data.referrer, 300) || 'Direct',
      page: sheetSafe(data.page, 200) || '/',
      screen: sheetSafe(data.screen, 20),
      language: sheetSafe(data.language, 20),
      timezone: sheetSafe(data.timezone, 60),
      userAgent: sheetSafe(userAgent, 300),
    };

    if (!SHEET_URL) {
      if (process.env.NODE_ENV !== 'production') console.info('[visit] VISITOR_SHEET_URL not set; would log:', row);
      return noContent();
    }

    // Apps Script answers a POST with a redirect; text/plain avoids a CORS preflight on its side.
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), SHEET_TIMEOUT_MS);
    try {
      await fetch(SHEET_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify(row),
        signal: controller.signal,
        cache: 'no-store',
      });
    } finally {
      clearTimeout(timer);
    }
  } catch (error: unknown) {
    // A failed log entry must never surface to the visitor
    console.error('[visit] could not record visit:', error instanceof Error ? error.message : error);
  }
  return noContent();
}

export const runtime = 'nodejs';
