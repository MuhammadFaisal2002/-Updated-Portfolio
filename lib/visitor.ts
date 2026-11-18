/** One row of the visitor log, as sent to the Google Sheet. */
export interface VisitRow {
  time: string;
  ip: string;
  city: string;
  region: string;
  country: string;
  device: string;
  os: string;
  browser: string;
  referrer: string;
  page: string;
  screen: string;
  language: string;
  timezone: string;
  userAgent: string;
}

/** Crawlers, link-preview fetchers, monitors and scripted clients: not real visitors. */
const BOT_PATTERN =
  /bot|crawl|spider|slurp|preview|headless|lighthouse|pagespeed|pingdom|uptime|monitor|facebookexternalhit|whatsapp|telegram|discord|slack|skype|embedly|curl|wget|python|axios|node-fetch|go-http|okhttp|java\/|postman|insomnia|scrapy|phantom|selenium|puppeteer|playwright/i;

export function isBot(userAgent: string): boolean {
  return userAgent.trim().length === 0 || BOT_PATTERN.test(userAgent);
}

/** Coarse device, OS and browser from a user-agent string. Good enough for a visitor log. */
export function describeUserAgent(ua: string): { device: string; os: string; browser: string } {
  const device = /ipad|tablet|(android(?!.*mobile))/i.test(ua) ? 'Tablet' : /mobi|iphone|ipod|android/i.test(ua) ? 'Mobile' : 'Desktop';

  let os = 'Other';
  if (/windows nt/i.test(ua)) os = 'Windows';
  else if (/android/i.test(ua)) os = 'Android';
  else if (/iphone|ipad|ipod/i.test(ua)) os = 'iOS';
  else if (/mac os x/i.test(ua)) os = 'macOS';
  else if (/cros/i.test(ua)) os = 'ChromeOS';
  else if (/linux/i.test(ua)) os = 'Linux';

  // Order matters: most Chromium browsers also say "Chrome" and "Safari"
  let browser = 'Other';
  if (/edg\//i.test(ua)) browser = 'Edge';
  else if (/opr\/|opera/i.test(ua)) browser = 'Opera';
  else if (/samsungbrowser/i.test(ua)) browser = 'Samsung Internet';
  else if (/firefox|fxios/i.test(ua)) browser = 'Firefox';
  else if (/chrome|crios/i.test(ua)) browser = 'Chrome';
  else if (/safari/i.test(ua)) browser = 'Safari';

  return { device, os, browser };
}

/**
 * Trim a value for the sheet and stop it being read as a formula. Google
 * Sheets treats text starting with = + - or @ as a formula, and the referrer,
 * page and user agent all come from the visitor.
 */
export function sheetSafe(value: unknown, maxLength: number): string {
  const text = typeof value === 'string' ? value.replace(/[\u0000-\u001f]/g, ' ').trim().slice(0, maxLength) : '';
  return /^[=+\-@]/.test(text) ? `'${text}` : text;
}

/** Vercel sends the visitor's city percent-encoded. */
export function decodeHeader(value: string | null): string {
  if (!value) return '';
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}
