"use client";

import Image from "next/image";
import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { LEGAL_ENTITY_NAME } from "@/lib/legal-identity";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import type { SupabaseAuthRuntimeStatus } from "@/lib/auth/runtime-config";

type BrowserRuntime = Pick<
  SupabaseAuthRuntimeStatus,
  "ready" | "url" | "projectRef" | "publishableKey"
> & { production: boolean };

export default function MfaChallenge({
  allowEnrollment,
  runtime,
  redirectUrl,
}: {
  allowEnrollment: boolean;
  runtime: BrowserRuntime;
  redirectUrl: string;
}) {
  const router = useRouter();
  const [supabase] = useState(() => createSupabaseBrowserClient(runtime));
  const [factorId, setFactorId] = useState<string | null>(null);
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [enrollmentAvailable, setEnrollmentAvailable] = useState(false);
  const [code, setCode] = useState("");
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    void supabase.auth.mfa.listFactors().then(({ data, error }) => {
      if (!active) return;
      const factor = data?.totp.find((candidate) => candidate.status === "verified");
      if (error) {
        setMessage("Authenticator status is temporarily unavailable.");
        return;
      }
      if (!factor) {
        if (allowEnrollment) setEnrollmentAvailable(true);
        else setMessage("A verified authenticator is required. Contact your administrator.");
        return;
      }
      setFactorId(factor.id);
    });
    return () => { active = false; };
  }, [allowEnrollment, supabase]);

  async function enroll() {
    if (!allowEnrollment) return;
    setPending(true);
    setMessage(null);
    try {
      const { data: factors, error: factorsError } = await supabase.auth.mfa.listFactors();
      if (factorsError) throw factorsError;
      const verified = factors?.totp.find((factor) => factor.status === "verified");
      if (verified) {
        setFactorId(verified.id);
        setEnrollmentAvailable(false);
        return;
      }
      for (const factor of factors?.totp ?? []) {
        const { error: unenrollError } = await supabase.auth.mfa.unenroll({ factorId: factor.id });
        if (unenrollError) throw unenrollError;
      }
      const { data, error } = await supabase.auth.mfa.enroll({
        factorType: "totp",
        friendlyName: `${LEGAL_ENTITY_NAME} owner access`,
      });
      if (error || !data?.id || !data.totp?.qr_code) {
        throw error ?? new Error("TOTP enrollment response was incomplete.");
      }
      setFactorId(data.id);
      setQrCode(data.totp.qr_code);
      setEnrollmentAvailable(false);
    } catch {
      setMessage("Authenticator enrollment is temporarily unavailable.");
    } finally {
      setPending(false);
    }
  }

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
        <h2>{qrCode ? "Enroll your authenticator" : "Verify your authenticator"}</h2>
        <p>
          {qrCode
            ? "Scan the provider-generated QR code, then enter the current six-digit code."
            : "Enter the current six-digit code from your approved TOTP authenticator."}
        </p>
      </div>
      {enrollmentAvailable ? (
        <button type="button" onClick={enroll} disabled={pending}>
          {pending ? "Starting enrollment…" : "Set up authenticator"}
        </button>
      ) : null}
      {qrCode ? (
        <Image
          src={qrCode}
          alt="TOTP authenticator enrollment QR code"
          width={240}
          height={240}
          unoptimized
        />
      ) : null}
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
