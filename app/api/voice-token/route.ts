import { NextResponse } from 'next/server';

/**
 * Returns a short-lived signed WebSocket URL for the ElevenLabs voice agent so the
 * browser can open an authenticated session without ever seeing the API key.
 * 503 when not configured — the client then falls back to the browser speech engine.
 */
export async function POST() {
  const agentId = process.env.ELEVENLABS_AGENT_ID;
  const apiKey = process.env.ELEVENLABS_API_KEY;

  if (!agentId || !apiKey) {
    return NextResponse.json({ error: 'Voice agent not configured.' }, { status: 503 });
  }

  try {
    const res = await fetch(
      `https://api.elevenlabs.io/v1/convai/conversation/get-signed-url?agent_id=${encodeURIComponent(agentId)}`,
      { headers: { 'xi-api-key': apiKey }, cache: 'no-store' },
    );

    if (!res.ok) {
      const detail = await res.text().catch(() => '');
      console.error('[voice-token] ElevenLabs error:', res.status, detail.slice(0, 300));
      return NextResponse.json({ error: 'Voice agent temporarily unavailable.' }, { status: 502 });
    }

    const data = (await res.json()) as { signed_url?: string };
    if (!data.signed_url) {
      return NextResponse.json({ error: 'Voice agent temporarily unavailable.' }, { status: 502 });
    }
    return NextResponse.json({ signedUrl: data.signed_url });
  } catch (err) {
    console.error('[voice-token] Unexpected error:', err);
    return NextResponse.json({ error: 'Voice agent temporarily unavailable.' }, { status: 500 });
  }
}
