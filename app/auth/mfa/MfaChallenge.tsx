"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import type { SupabaseAuthRuntimeStatus } from "@/lib/auth/runtime-config";

type BrowserRuntime = Pick<
  SupabaseAuthRuntimeStatus,
  "ready" | "url" | "projectRef" | "publishableKey"
> & { production: boolean };

export default function MfaChallenge({
  runtime,
  redirectUrl,
}: {
  runtime: BrowserRuntime;
  redirectUrl: string;
}) {
  const router = useRouter();
  const [supabase] = useState(() => createSupabaseBrowserClient(runtime));
  const [factorId, setFactorId] = useState<string | null>(null);
  const [code, setCode] = useState("");
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    void supabase.auth.mfa.listFactors().then(({ data, error }) => {
      if (!active) return;
      const factor = data?.totp.find((candidate) => candidate.status === "verified");
      if (error || !factor) {
        setMessage("A verified authenticator is required. Contact your administrator.");
        return;
      }
      setFactorId(factor.id);
    });
    return () => { active = false; };
  }, [supabase]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!factorId) return;
    setPending(true);
    setMessage(null);
    try {
      const { error } = await supabase.auth.mfa.challengeAndVerify({ factorId, code });
      if (error) {
        setMessage("The verification code was not accepted.");
        return;
      }
      const { data, error: assuranceError } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
      if (assuranceError || data.currentLevel !== "aal2") {
        throw assuranceError ?? new Error("AAL2 was not established.");
      }
      router.push(redirectUrl);
      router.refresh();
    } catch {
      setMessage("Multi-factor verification is temporarily unavailable.");
    } finally {
      setPending(false);
    }
  }

  return (
    <form onSubmit={submit} style={{ width: "100%", display: "grid", gap: 16 }}>
      <div>
        <p className="eyebrow">SECOND FACTOR</p>
        <h2>Verify your authenticator</h2>
        <p>Enter the current six-digit code from your approved TOTP authenticator.</p>
      </div>
      <label style={{ display: "grid", gap: 7 }}>
        <span>Verification code</span>
        <input
          name="code"
          type="text"
          inputMode="numeric"
          autoComplete="one-time-code"
          pattern="[0-9]{6}"
          minLength={6}
          maxLength={6}
          required
          value={code}
          onChange={(event) => setCode(event.target.value.replace(/\D/g, "").slice(0, 6))}
          disabled={pending || !factorId}
        />
      </label>
      {message ? <p role="alert">{message}</p> : null}
      <button type="submit" disabled={pending || !factorId || code.length !== 6}>
        {pending ? "Verifying…" : "Verify and continue"}
      </button>
    </form>
  );
}
