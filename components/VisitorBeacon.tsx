'use client';

import { useEffect } from 'react';
import { visitorLoggingAllowed } from '@/lib/visitorClient';

const SESSION_FLAG = 'visit-logged';
/** Wait a moment so prefetches and instant bounces are not counted as visits. */
const SEND_DELAY_MS = 1500;

/**
 * Tells the server about this visit, once per browser session. The server adds
 * the IP address and location and writes a row to the visitor log.
 *
 * Visitors whose browser sends Do Not Track or Global Privacy Control are not
 * logged. Renders nothing.
 */
export default function VisitorBeacon() {
  useEffect(() => {
    if (!visitorLoggingAllowed()) return;

    try {
      if (sessionStorage.getItem(SESSION_FLAG)) return;
    } catch {
      /* storage blocked: fall through and let the server de-duplicate */
    }

    const timer = setTimeout(() => {
      if (document.visibilityState !== 'visible') return;

      const payload = JSON.stringify({
        page: window.location.pathname + window.location.hash,
        referrer: document.referrer,
        screen: `${window.screen.width}x${window.screen.height}`,
        language: navigator.language,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      });

      try {
        sessionStorage.setItem(SESSION_FLAG, '1');
      } catch {
        /* ignore */
      }

      const blob = new Blob([payload], { type: 'application/json' });
      if (!navigator.sendBeacon?.('/api/visit', blob)) {
        void fetch('/api/visit', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: payload,
          keepalive: true,
        }).catch(() => undefined);
      }
    }, SEND_DELAY_MS);

    return () => clearTimeout(timer);
  }, []);

  return null;
}
