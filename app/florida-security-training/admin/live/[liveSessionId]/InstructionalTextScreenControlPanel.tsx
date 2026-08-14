"use client";

import { useCallback, useEffect, useState } from "react";
import InstructionalTextScreenControl from "./InstructionalTextScreenControl";

type AdminState = {
  session?: { status?: string; current_segment_type?: "instruction" | "break" };
  students?: Array<{ id?: string }>;
  activeTextScreen?: { id?: string; title?: string; body?: string; word_count?: number; minimum_seconds?: number; status?: "open" | "closed" } | null;
  textScreenViews?: Array<{ enrollment_id?: string; observed_seconds?: number; requirement_met_at?: string | null; acknowledged_at?: string | null }>;
};

export default function InstructionalTextScreenControlPanel({ liveSessionId }: { liveSessionId: string }) {
  const [state, setState] = useState<AdminState | null>(null);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    const response = await fetch(`/api/florida-class-d/admin/live?liveSessionId=${encodeURIComponent(liveSessionId)}`, { cache: "no-store" });
    const payload = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(typeof payload?.error === "string" ? payload.error : "Unable to load instructional text state.");
    setState(payload as AdminState);
    setError(null);
  }, [liveSessionId]);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try { if (!cancelled) await refresh(); }
      catch (loadError) { if (!cancelled) setError(loadError instanceof Error ? loadError.message : "Unable to load instructional text state."); }
    };
    void load();
    const timer = window.setInterval(() => void load(), 10_000);
    return () => { cancelled = true; window.clearInterval(timer); };
  }, [refresh]);

  if (error && !state) return <div className="fdacs-live__alert">{error}</div>;

  return <InstructionalTextScreenControl liveSessionId={liveSessionId} status={state?.session?.status ?? "loading"} isBreak={state?.session?.current_segment_type === "break"} activeTextScreen={state?.activeTextScreen ?? null} textScreenViews={state?.textScreenViews ?? []} students={state?.students ?? []} onChanged={refresh} />;
}
