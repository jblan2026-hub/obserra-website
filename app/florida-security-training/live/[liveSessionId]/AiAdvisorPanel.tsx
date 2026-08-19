"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import styles from "./AiAdvisorPanel.module.css";

const MAX_QUESTION_LENGTH = 1_200;

type AdvisorResponse = {
  answer?: string;
  audioBase64?: string | null;
  audioMimeType?: string | null;
  correlationId?: string;
  assessmentIntegrity?: string;
  creditAuthority?: string;
  error?: string;
};

function audioUrlFromBase64(base64: string, mimeType: string) {
  const binary = window.atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index += 1) bytes[index] = binary.charCodeAt(index);
  return URL.createObjectURL(new Blob([bytes], { type: mimeType }));
}

export default function AiAdvisorPanel({ liveSessionId }: { liveSessionId: string }) {
  const [open, setOpen] = useState(false);
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [correlationId, setCorrelationId] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => () => {
    abortRef.current?.abort();
    if (audioUrl) URL.revokeObjectURL(audioUrl);
  }, [audioUrl]);

  function replaceAudioUrl(next: string | null) {
    setAudioUrl((current) => {
      if (current) URL.revokeObjectURL(current);
      return next;
    });
  }

  async function askAdvisor(event: FormEvent) {
    event.preventDefault();
    const prompt = question.trim();
    if (prompt.length < 2 || prompt.length > MAX_QUESTION_LENGTH || busy) return;

    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    setBusy(true);
    setError(null);
    setAnswer("");
    setCorrelationId(null);
    replaceAudioUrl(null);

    try {
      const response = await fetch("/api/florida-class-d/live/advisor", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ liveSessionId, question: prompt, voice: voiceEnabled }),
        signal: controller.signal,
        cache: "no-store",
      });
      const payload = (await response.json()) as AdvisorResponse;
      if (!response.ok || !payload.answer) throw new Error(payload.error || "AI Advisor is unavailable.");

      setAnswer(payload.answer);
      setCorrelationId(payload.correlationId ?? null);
      if (payload.audioBase64 && payload.audioMimeType) {
        const nextUrl = audioUrlFromBase64(payload.audioBase64, payload.audioMimeType);
        replaceAudioUrl(nextUrl);
        queueMicrotask(() => void audioRef.current?.play().catch(() => undefined));
      }
    } catch (requestError) {
      if (controller.signal.aborted) return;
      setError(requestError instanceof Error ? requestError.message : "AI Advisor is unavailable.");
    } finally {
      if (abortRef.current === controller) abortRef.current = null;
      setBusy(false);
    }
  }

  function cancelRequest() {
    abortRef.current?.abort();
    abortRef.current = null;
    setBusy(false);
  }

  return (
    <div className={styles.dock}>
      <button
        type="button"
        className={styles.launcher}
        aria-expanded={open}
        aria-controls="fdacs-ai-advisor-panel"
        onClick={() => setOpen((value) => !value)}
      >
        <span className={styles.launcherMark} aria-hidden="true">AI</span>
        <span><strong>AI Advisor</strong><small>Reasoning + human-like voice</small></span>
      </button>

      {open ? (
        <section id="fdacs-ai-advisor-panel" className={styles.panel} aria-label="Florida Class D AI Advisor">
          <header className={styles.header}>
            <div><span>OBSERRA LEARNING INTELLIGENCE</span><h2>AI Advisor</h2></div>
            <button type="button" className={styles.close} onClick={() => setOpen(false)} aria-label="Close AI Advisor">Close</button>
          </header>

          <p className={styles.boundary}>Educational guidance only. Your instructor and deterministic LMS controls remain authoritative for attendance, credit, assessments, completion, and licensing.</p>

          <form className={styles.form} onSubmit={askAdvisor}>
            <label htmlFor="fdacs-ai-question">Ask about the current live lesson</label>
            <textarea
              id="fdacs-ai-question"
              value={question}
              onChange={(event) => setQuestion(event.target.value)}
              maxLength={MAX_QUESTION_LENGTH}
              placeholder="Explain this concept, give me an example, or check my understanding."
              disabled={busy}
            />
            <div className={styles.controls}>
              <label className={styles.voiceToggle}>
                <input type="checkbox" checked={voiceEnabled} onChange={(event) => setVoiceEnabled(event.target.checked)} disabled={busy} />
                <span>Voice</span>
              </label>
              <span className={styles.count}>{question.length} / {MAX_QUESTION_LENGTH}</span>
              {busy ? <button type="button" className={styles.secondary} onClick={cancelRequest}>Cancel</button> : null}
              <button type="submit" className={styles.primary} disabled={busy || question.trim().length < 2}>{busy ? "Reasoning…" : "Ask advisor"}</button>
            </div>
          </form>

          <div className={styles.response} aria-live="polite" aria-busy={busy}>
            {busy ? <p className={styles.status}>Analyzing the current lesson and preparing a grounded response…</p> : null}
            {error ? <p className={styles.error} role="alert">{error}</p> : null}
            {answer ? <div><span className={styles.responseLabel}>Advisor response</span><p>{answer}</p></div> : null}
            {audioUrl ? <audio ref={audioRef} className={styles.audio} controls preload="none" src={audioUrl}>Voice playback is not supported by this browser.</audio> : null}
            {correlationId ? <small className={styles.correlation}>Request reference: {correlationId}</small> : null}
          </div>
        </section>
      ) : null}
    </div>
  );
}
