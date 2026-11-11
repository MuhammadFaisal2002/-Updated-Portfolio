'use client';
import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Phone, PhoneOff, Mic, MicOff, X, Loader2, Volume2 } from 'lucide-react';
import type { Conversation as ElevenConversation } from '@elevenlabs/client';

/**
 * Voice assistant with two engines:
 *  1. ElevenLabs Conversational AI (primary) — natural voice, interruptions, server-side agent.
 *     The browser gets a signed URL from /api/voice-token; the API key never leaves the server.
 *  2. Browser Web Speech API (fallback) — used when ElevenLabs is not configured, out of quota,
 *     or unreachable. Speech-to-text → /api/chat → speech synthesis. No keys required.
 */

type CallState = 'idle' | 'connecting' | 'listening' | 'thinking' | 'speaking' | 'ended';
type Engine = 'elevenlabs' | 'browser';
interface Turn { role: 'user' | 'assistant'; text: string }

type ElevenSession = Awaited<ReturnType<typeof ElevenConversation.startSession>>;

// Minimal typings for SpeechRecognition (not part of the TypeScript DOM lib)
interface SRAlternative { transcript: string }
interface SRResult { isFinal: boolean; length: number; [i: number]: SRAlternative }
interface SRResultList { length: number; [i: number]: SRResult }
interface SREvent { resultIndex: number; results: SRResultList }
interface SRErrorEvent { error: string }
interface SpeechRecognitionLike {
  lang: string;
  interimResults: boolean;
  continuous: boolean;
  maxAlternatives: number;
  onresult: ((e: SREvent) => void) | null;
  onend: (() => void) | null;
  onerror: ((e: SRErrorEvent) => void) | null;
  start(): void;
  stop(): void;
  abort(): void;
}
type SRCtor = new () => SpeechRecognitionLike;

function getRecognitionCtor(): SRCtor | null {
  if (typeof window === 'undefined') return null;
  const w = window as unknown as { SpeechRecognition?: SRCtor; webkitSpeechRecognition?: SRCtor };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
}

// Strip emojis, bullets and markdown so the browser voice does not read symbols aloud
function cleanForSpeech(text: string): string {
  return text
    .replace(/[\p{Extended_Pictographic}\u{FE0F}\u{200D}]/gu, '')
    .replace(/[•*_#`>]/g, '')
    .replace(/https?:\/\//g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function formatDuration(s: number): string {
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
}

const GREETING = "Hi! I'm Faisal's AI voice assistant. Ask me about his experience, projects, skills, or services.";

export default function VoiceAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [callState, setCallState] = useState<CallState>('idle');
  const [engine, setEngine] = useState<Engine>('elevenlabs');
  const [turns, setTurns] = useState<Turn[]>([]);
  const [interim, setInterim] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [muted, setMuted] = useState(false);
  const [duration, setDuration] = useState(0);

  const activeRef   = useRef(false);
  const mutedRef    = useRef(false);
  const engineRef   = useRef<Engine>('elevenlabs');
  const sessionRef  = useRef<ElevenSession | null>(null);
  const recRef      = useRef<SpeechRecognitionLike | null>(null);
  const turnsRef    = useRef<Turn[]>([]);
  const startedAt   = useRef(0);
  const endRef      = useRef<HTMLDivElement>(null);

  const inCall = callState !== 'idle' && callState !== 'ended';

  // Call timer
  useEffect(() => {
    if (!inCall) return;
    const id = setInterval(() => setDuration(Math.floor((Date.now() - startedAt.current) / 1000)), 1000);
    return () => clearInterval(id);
  }, [inCall]);

  // Warm up the ElevenLabs SDK chunk as soon as the panel opens so "Start" connects fast
  useEffect(() => {
    if (isOpen) void import('@elevenlabs/client').catch(() => { /* fallback engine still works */ });
  }, [isOpen]);

  // Keep transcript scrolled to the latest line
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [turns, interim]);

  // Tear everything down if the component unmounts mid-call
  useEffect(() => () => {
    activeRef.current = false;
    recRef.current?.abort();
    window.speechSynthesis?.cancel();
    void sessionRef.current?.endSession();
  }, []);

  function pushTurn(turn: Turn) {
    turnsRef.current = [...turnsRef.current, turn];
    setTurns(turnsRef.current);
  }

  function resetCall() {
    activeRef.current = true;
    mutedRef.current = false;
    setMuted(false);
    turnsRef.current = [];
    setTurns([]);
    setInterim('');
    startedAt.current = Date.now();
    setDuration(0);
  }

  // ── Engine 1: ElevenLabs ────────────────────────────────────────────────────
  async function startElevenLabs(): Promise<boolean> {
    let signedUrl: string | undefined;
    try {
      const res = await fetch('/api/voice-token', { method: 'POST' });
      if (!res.ok) return false; // 503 = not configured, 502 = provider down → fallback
      signedUrl = ((await res.json()) as { signedUrl?: string }).signedUrl;
    } catch {
      return false;
    }
    if (!signedUrl) return false;

    try {
      const { Conversation } = await import('@elevenlabs/client');
      const session = await Conversation.startSession({
        signedUrl,
        connectionType: 'websocket',
        onConnect: () => {
          if (!activeRef.current) { void session.endSession(); return; }
          setCallState('listening');
        },
        onModeChange: ({ mode }) => {
          if (!activeRef.current) return;
          setCallState(mode === 'speaking' ? 'speaking' : 'listening');
        },
        onMessage: ({ message, source }) => {
          // Strip ElevenLabs audio tags like [happy] or [laughs] from the visible transcript
          const text = (message ?? '').replace(/\[[a-z][a-z ]{0,30}\]/gi, '').replace(/\s+/g, ' ').trim();
          if (!activeRef.current || !text) return;
          pushTurn({ role: source === 'user' ? 'user' : 'assistant', text });
        },
        onDisconnect: (details) => {
          sessionRef.current = null;
          if (!activeRef.current) return;
          if (details.reason === 'error') setError('The voice connection dropped. You can call again.');
          activeRef.current = false;
          setCallState('ended');
        },
        onError: (message) => {
          console.error('[voice] ElevenLabs error:', message);
        },
      });
      sessionRef.current = session;
      return true;
    } catch (err) {
      console.error('[voice] ElevenLabs session failed, falling back to browser speech:', err);
      return false;
    }
  }

  // ── Engine 2: browser Web Speech API ────────────────────────────────────────
  function speak(text: string, onDone: () => void) {
    const synth = window.speechSynthesis;
    if (!synth) { onDone(); return; }
    synth.cancel();
    const utterance = new SpeechSynthesisUtterance(cleanForSpeech(text));
    utterance.lang = 'en-US';
    utterance.rate = 1;
    const voices = synth.getVoices();
    const preferred =
      voices.find((v) => v.lang.startsWith('en') && /natural|google|aria|jenny|samantha|zira/i.test(v.name)) ??
      voices.find((v) => v.lang.startsWith('en'));
    if (preferred) utterance.voice = preferred;
    let finished = false;
    const finish = () => { if (!finished) { finished = true; onDone(); } };
    utterance.onend = finish;
    utterance.onerror = finish;
    setCallState('speaking');
    synth.speak(utterance);
  }

  function listen() {
    if (!activeRef.current || mutedRef.current) return;
    const Ctor = getRecognitionCtor();
    if (!Ctor) return;

    const rec = new Ctor();
    rec.lang = 'en-US';
    rec.interimResults = true;
    rec.continuous = false;
    rec.maxAlternatives = 1;
    let finalText = '';

    rec.onresult = (e) => {
      let live = '';
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const result = e.results[i];
        if (!result) continue;
        if (result.isFinal) finalText += result[0]?.transcript ?? '';
        else live += result[0]?.transcript ?? '';
      }
      setInterim(live);
    };

    rec.onerror = (e) => {
      if (e.error === 'not-allowed' || e.error === 'service-not-allowed') {
        setError('Microphone access denied. Allow the mic in your browser settings and try again.');
        endCall();
      }
      // "no-speech" and "aborted" fall through to onend, which restarts listening
    };

    rec.onend = () => {
      setInterim('');
      if (!activeRef.current) return;
      const text = finalText.trim();
      if (text) void handleUserText(text);
      else if (!mutedRef.current) listen();
    };

    recRef.current = rec;
    setCallState('listening');
    try { rec.start(); } catch { /* already started */ }
  }

  async function handleUserText(text: string) {
    const history = turnsRef.current.slice(-10).map((t) => ({ role: t.role, content: t.text }));
    pushTurn({ role: 'user', text });
    setCallState('thinking');

    let reply: string;
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text, messages: history }),
      });
      const data = (await res.json()) as { message?: string };
      reply = data.message?.trim() || "Sorry, I didn't catch that. Could you say it again?";
    } catch {
      reply = "I'm having trouble connecting right now. Please try again in a moment.";
    }

    if (!activeRef.current) return;
    pushTurn({ role: 'assistant', text: reply });
    speak(reply, () => { if (activeRef.current) listen(); });
  }

  function startBrowser(): boolean {
    if (!getRecognitionCtor()) return false;
    pushTurn({ role: 'assistant', text: GREETING });
    speak(GREETING, () => { if (activeRef.current) listen(); });
    return true;
  }

  // ── Call lifecycle ──────────────────────────────────────────────────────────
  async function startCall() {
    setError(null);
    setCallState('connecting');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach((t) => t.stop());
    } catch {
      setError('Microphone access denied. Allow the mic in your browser settings to start a voice call.');
      setCallState('idle');
      return;
    }

    resetCall();

    if (await startElevenLabs()) {
      engineRef.current = 'elevenlabs';
      setEngine('elevenlabs');
      return; // onConnect flips the state to listening
    }
    if (!activeRef.current) return; // user closed the panel while connecting

    engineRef.current = 'browser';
    setEngine('browser');
    if (!startBrowser()) {
      activeRef.current = false;
      setError('Voice calls need Chrome, Edge, or Safari. Please use the text chat instead.');
      setCallState('idle');
    }
  }

  function endCall() {
    activeRef.current = false;
    recRef.current?.abort();
    recRef.current = null;
    window.speechSynthesis?.cancel();
    const session = sessionRef.current;
    sessionRef.current = null;
    void session?.endSession();
    setInterim('');
    setCallState('ended');
  }

  function toggleMute() {
    const next = !mutedRef.current;
    mutedRef.current = next;
    setMuted(next);
    if (engineRef.current === 'elevenlabs') {
      sessionRef.current?.setMicMuted(next);
      return;
    }
    if (next) {
      recRef.current?.abort();
      setCallState('listening');
    } else {
      listen();
    }
  }

  function closePanel() {
    if (inCall) endCall();
    setIsOpen(false);
    setCallState('idle');
  }

  const statusLabel =
    callState === 'connecting' ? 'Connecting…'
    : callState === 'thinking' ? 'Thinking…'
    : callState === 'speaking' ? 'AI speaking'
    : muted ? 'Muted'
    : callState === 'listening' ? 'Listening…'
    : '';

  const engineLabel = engine === 'elevenlabs' ? 'ElevenLabs voice' : 'Browser voice';

  return (
    <>
      {/* Floating call button */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            onClick={() => setIsOpen(true)}
            className="fixed bottom-48 right-8 z-50 w-16 h-16 rounded-full bg-gradient-to-r from-rose-600 to-primary text-white shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center group"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            aria-label="Start AI voice call"
          >
            <Phone size={26} className="group-hover:scale-110 transition-transform" />
            <span className="absolute inset-0 rounded-full border-2 border-primary animate-ping opacity-30" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Call panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-4 right-4 z-50 w-96 max-w-[calc(100vw-2rem)] max-h-[calc(100vh-2rem)] rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-primary/20"
            style={{ backgroundColor: 'var(--card)' }}
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-rose-600 to-primary text-white p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                  <Phone size={20} />
                </div>
                <div>
                  <h3 className="font-bold">AI Voice Assistant</h3>
                  <p className="text-xs opacity-90 font-mono">
                    {inCall ? `${statusLabel} · ${formatDuration(duration)}` : 'Talk to Faisal’s AI'}
                  </p>
                </div>
              </div>
              <button onClick={closePanel} className="hover:bg-white/20 p-2 rounded-lg transition-colors" aria-label="Close voice assistant">
                <X size={20} />
              </button>
            </div>

            <div className="p-5 flex flex-col gap-4 overflow-y-auto">
              {error && (
                <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-500 text-sm">{error}</div>
              )}

              {/* IDLE */}
              {callState === 'idle' && (
                <div className="flex flex-col items-center text-center gap-4 py-4">
                  <div className="w-20 h-20 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center">
                    <Mic size={32} className="text-primary" />
                  </div>
                  <div>
                    <p className="font-bold" style={{ color: 'var(--foreground)' }}>Hands-free Q&amp;A</p>
                    <p className="text-sm opacity-70 mt-1" style={{ color: 'var(--foreground)' }}>
                      Ask about experience, projects, pricing or availability. Talk naturally, interrupt any time.
                    </p>
                  </div>
                  <button
                    onClick={() => void startCall()}
                    className="w-full px-6 py-3 bg-primary hover:bg-primary-hover text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                  >
                    <Phone size={18} /> Start Voice Call
                  </button>
                  <p className="text-[11px] opacity-50 font-mono" style={{ color: 'var(--foreground)' }}>
                    Powered by ElevenLabs · works best with headphones
                  </p>
                </div>
              )}

              {/* CONNECTING */}
              {callState === 'connecting' && (
                <div className="flex flex-col items-center gap-4 py-8">
                  <div className="relative w-16 h-16 flex items-center justify-center">
                    <span className="absolute inset-0 rounded-full border-2 border-primary animate-ping opacity-40" />
                    <span className="w-14 h-14 rounded-full bg-primary flex items-center justify-center text-white">
                      <Phone size={22} />
                    </span>
                  </div>
                  <p className="font-mono text-xs uppercase tracking-widest opacity-70" style={{ color: 'var(--foreground)' }}>
                    Connecting…
                  </p>
                </div>
              )}

              {/* ACTIVE */}
              {(callState === 'listening' || callState === 'thinking' || callState === 'speaking') && (
                <>
                  <div className="flex flex-col items-center gap-2 py-2">
                    {callState === 'speaking' ? (
                      <div className="flex items-end gap-1 h-8">
                        {[0, 1, 2, 3, 4].map((i) => (
                          <motion.span
                            key={i}
                            className="w-1.5 rounded-full bg-primary"
                            animate={{ height: ['30%', '100%', '30%'] }}
                            transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.12 }}
                          />
                        ))}
                      </div>
                    ) : callState === 'thinking' ? (
                      <Loader2 size={28} className="animate-spin text-primary" />
                    ) : (
                      <div className="relative w-10 h-10 flex items-center justify-center">
                        {!muted && <span className="absolute inset-0 rounded-full border border-primary animate-ping opacity-40" />}
                        {muted ? <MicOff size={22} className="text-amber-500" /> : <Mic size={22} className="text-primary" />}
                      </div>
                    )}
                    <p className={`font-mono text-[11px] uppercase tracking-widest ${callState === 'speaking' ? 'text-primary' : 'opacity-70'}`} style={callState !== 'speaking' ? { color: 'var(--foreground)' } : undefined}>
                      {callState === 'speaking' ? '● AI speaking' : statusLabel}
                    </p>
                  </div>

                  {/* Live transcript */}
                  <div className="rounded-lg p-3 max-h-56 overflow-y-auto flex flex-col gap-3 border border-primary/10" style={{ backgroundColor: 'var(--background)' }}>
                    {turns.length === 0 && !interim && (
                      <p className="text-xs opacity-50 italic text-center py-2" style={{ color: 'var(--foreground)' }}>Say hello to get started…</p>
                    )}
                    {turns.map((t, i) => (
                      <div key={i} className={`flex flex-col gap-0.5 ${t.role === 'user' ? 'items-end' : 'items-start'}`}>
                        <span className={`font-mono text-[9px] uppercase tracking-widest ${t.role === 'user' ? 'opacity-50' : 'text-primary'}`} style={t.role === 'user' ? { color: 'var(--foreground)' } : undefined}>
                          {t.role === 'user' ? 'You' : "Faisal's AI"}
                        </span>
                        <p className="text-xs leading-relaxed max-w-[90%] whitespace-pre-wrap" style={{ color: 'var(--foreground)' }}>{t.text}</p>
                      </div>
                    ))}
                    {interim && (
                      <div className="flex flex-col gap-0.5 items-end">
                        <span className="font-mono text-[9px] uppercase tracking-widest opacity-50" style={{ color: 'var(--foreground)' }}>You</span>
                        <p className="text-xs leading-relaxed max-w-[90%] italic opacity-60" style={{ color: 'var(--foreground)' }}>{interim}…</p>
                      </div>
                    )}
                    <div ref={endRef} />
                  </div>

                  {/* Controls */}
                  <div className="flex gap-2">
                    <button
                      onClick={toggleMute}
                      className={`flex-1 flex items-center justify-center gap-2 font-mono text-xs uppercase tracking-widest py-2.5 rounded-lg border transition-colors ${
                        muted ? 'bg-amber-500/10 text-amber-500 border-amber-500/30' : 'border-primary/20 hover:border-primary/50'
                      }`}
                      style={muted ? undefined : { color: 'var(--foreground)' }}
                    >
                      {muted ? <MicOff size={14} /> : <Mic size={14} />}
                      {muted ? 'Unmute' : 'Mute'}
                    </button>
                    <button
                      onClick={endCall}
                      className="flex-1 flex items-center justify-center gap-2 bg-red-500/10 text-red-500 border border-red-500/30 hover:bg-red-500/20 font-mono text-xs uppercase tracking-widest py-2.5 rounded-lg transition-colors"
                    >
                      <PhoneOff size={14} /> End
                    </button>
                  </div>
                  <p className="text-[10px] opacity-40 font-mono text-center -mt-1" style={{ color: 'var(--foreground)' }}>{engineLabel}</p>
                </>
              )}

              {/* ENDED */}
              {callState === 'ended' && (
                <div className="flex flex-col gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs">MF</div>
                    <p className="text-sm opacity-80" style={{ color: 'var(--foreground)' }}>Call ended · {formatDuration(duration)}</p>
                  </div>
                  {turns.length > 0 && (
                    <div className="rounded-lg p-3 max-h-48 overflow-y-auto flex flex-col gap-2 border border-primary/10" style={{ backgroundColor: 'var(--background)' }}>
                      <p className="font-mono text-[9px] uppercase tracking-widest opacity-50 mb-1" style={{ color: 'var(--foreground)' }}>Conversation recap</p>
                      {turns.map((t, i) => (
                        <p key={i} className="text-xs leading-relaxed" style={{ color: 'var(--foreground)' }}>
                          <span className={`font-mono text-[9px] font-bold mr-1.5 ${t.role === 'user' ? 'opacity-50' : 'text-primary'}`}>
                            {t.role === 'user' ? 'You:' : 'AI:'}
                          </span>
                          {t.text}
                        </p>
                      ))}
                    </div>
                  )}
                  <div className="flex gap-2">
                    <button
                      onClick={() => void startCall()}
                      className="flex-1 px-4 py-2.5 bg-primary hover:bg-primary-hover text-white rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2"
                    >
                      <Phone size={14} /> Call again
                    </button>
                    <a
                      href="#contact"
                      onClick={closePanel}
                      className="flex-1 px-4 py-2.5 border border-primary rounded-lg text-sm font-medium text-center hover:bg-primary/10 transition-colors flex items-center justify-center gap-2"
                      style={{ color: 'var(--foreground)' }}
                    >
                      <Volume2 size={14} /> Contact Faisal
                    </a>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
