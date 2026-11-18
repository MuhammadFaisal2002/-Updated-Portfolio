interface PrivacySignals {
  doNotTrack?: string | null;
  globalPrivacyControl?: boolean;
}

/** False when the browser sends Do Not Track or Global Privacy Control. Browser only. */
export function visitorLoggingAllowed(): boolean {
  if (typeof navigator === 'undefined') return false;
  const signals = navigator as Navigator & PrivacySignals;
  return signals.doNotTrack !== '1' && signals.globalPrivacyControl !== true;
}

/**
 * After a contact form is sent, attach the sender's name and email to their
 * row in the visitor log. Fire-and-forget: it never blocks or fails the form.
 */
export function linkContactToVisit(contact: { name: string; email: string }): void {
  if (!visitorLoggingAllowed()) return;
  void fetch('/api/visit/contact', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: contact.name, email: contact.email }),
    keepalive: true,
  }).catch(() => undefined);
}
