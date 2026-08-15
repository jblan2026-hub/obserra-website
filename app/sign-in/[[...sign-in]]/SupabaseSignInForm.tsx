"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { LEGAL_ENTITY_NAME } from "@/lib/legal-identity";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import type { SupabaseAuthRuntimeStatus } from "@/lib/auth/runtime-config";

type BrowserRuntime = Pick<
  SupabaseAuthRuntimeStatus,
  "ready" | "url" | "projectRef" | "publishableKey"
> & { production: boolean };

export default function SupabaseSignInForm({
  runtime,
  redirectUrl,
}: {
  runtime: BrowserRuntime;
  redirectUrl: string;
}) {
  const router = useRouter();
  const [supabase] = useState(() => createSupabaseBrowserClient(runtime));
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setMessage(null);
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        setMessage("Sign-in was not accepted. Check your credentials or contact your administrator.");
        return;
      }

      const { data, error: assuranceError } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
      if (assuranceError) throw assuranceError;
      if (data.currentLevel === "aal2") {
        router.push(redirectUrl);
        router.refresh();
        return;
      }
      router.push(`/auth/mfa?redirect_url=${encodeURIComponent(redirectUrl)}`);
    } catch {
      setMessage("Identity verification is temporarily unavailable. Please try again later.");
    } finally {
      setPending(false);
    }
  }

  return (
    <form onSubmit={submit} aria-label={`${LEGAL_ENTITY_NAME} secure sign in`} style={{ width: "100%", display: "grid", gap: 16 }}>
      <div>
        <p className="eyebrow">INVITATION-ONLY ACCESS</p>
        <h2>Authorized account sign in</h2>
        <p>Use the credentials issued to your approved {LEGAL_ENTITY_NAME} identity.</p>
      </div>
      <label style={{ display: "grid", gap: 7 }}>
        <span>Email</span>
        <input
          name="email"
          type="email"
          autoComplete="username"
          required
          maxLength={320}
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          disabled={pending}
        />
      </label>
      <label style={{ display: "grid", gap: 7 }}>
        <span>Password</span>
        <input
          name="password"
          type="password"
          autoComplete="current-password"
          required
          minLength={8}
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          disabled={pending}
        />
      </label>
      {message ? <p role="alert">{message}</p> : null}
      <button type="submit" disabled={pending}>
        {pending ? "Verifying…" : "Continue securely"}
      </button>
    </form>
  );
}
