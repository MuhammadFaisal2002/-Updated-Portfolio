import { NextResponse } from 'next/server';
import { getClientIp, isRateLimited } from '@/lib/rateLimit';
import { isBot, sheetSafe } from '@/lib/visitor';

/**
 * Links a contact-form sender to their row in the visitor log. The contact
 * form calls this after a message is sent; the sheet script finds the most
 * recent row with the same IP and fills in its Name and Email columns.
 *
 * Uses the same VISITOR_SHEET_URL as the visit route. Without it, nothing is
 * stored.
 */

const SHEET_URL = process.env.VISITOR_SHEET_URL;
const SHEET_TIMEOUT_MS = 5000;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const noContent = () => new NextResponse(null, { status: 204 });

export async function POST(request: Request) {
  try {
    const userAgent = request.headers.get('user-agent') ?? '';
    if (isBot(userAgent)) return noContent();

    const ip = getClientIp(request);
    if (isRateLimited(`contact:${ip}`)) return noContent();

    const body: unknown = await request.json().catch(() => null);
    const data = typeof body === 'object' && body !== null ? (body as Record<string, unknown>) : {};
    const name = sheetSafe(data.name, 100);
    const email = sheetSafe(data.email, 200);
    if (!name || !EMAIL_PATTERN.test(email)) return noContent();

    const row = { type: 'contact', time: new Date().toISOString(), ip: sheetSafe(ip, 60), name, email };

    if (!SHEET_URL) {
      if (process.env.NODE_ENV !== 'production') console.info('[visit] VISITOR_SHEET_URL not set; would link contact:', row);
      return noContent();
    }

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
    // Linking is a nicety; it must never surface to the person who just sent a message
    console.error('[visit] could not link contact:', error instanceof Error ? error.message : error);
  }
  return noContent();
}

export const runtime = 'nodejs';
