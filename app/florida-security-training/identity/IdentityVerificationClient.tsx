"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

type VerificationStatus = {
  enrollmentId?: string | null;
  enrollmentStatus?: string | null;
  executionProfile?: string | null;
  trainingCreditEligible?: boolean | null;
  identityStatus?: string | null;
  providerStatus?: string | null;
  documentCheckStatus?: string | null;
  selfieCheckStatus?: string | null;
  instructorAttestationRecorded?: boolean;
  instructionalAccessGranted?: boolean;
};

type StatusResponse = {
  status?: VerificationStatus;
  verificationEnabled?: boolean;
  consentVersion?: string;
  identityImagesStoredByLms?: boolean;
  biometricTemplatesStoredByLms?: boolean;
  instructorAttestationRequired?: boolean;
  executionProfile?: string;
  trainingCreditEligible?: boolean;
  fdacsApprovalClaimed?: boolean;
  error?: string;
};

type IdentityLobbyAccess = {
  provider?: "daily";
  accessMode?: "identity_lobby_noninstructional";
  joinUrl?: string;
  tokenExpiresAt?: string;
  recordingEnabled?: boolean;
  attendanceCredited?: boolean;
  instructionalTimeCredited?: boolean;
  rawIdentityImagesStoredByLms?: boolean;
};

async function loadStatus() {
  const response = await fetch("/api/florida-class-d/identity-verification", {
    cache: "no-store",
    headers: { accept: "application/json" },
  });
  const payload = await response.json().catch(() => ({})) as StatusResponse;
  if (!response.ok) throw new Error(payload.error || "Identity-verification status is unavailable.");
  return payload;
}

export default function IdentityVerificationClient() {
  const [payload, setPayload] = useState<StatusResponse | null>(null);
  const [consentAccepted, setConsentAccepted] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [identityLobby, setIdentityLobby] = useState<IdentityLobbyAccess | null>(null);
  const [lobbyError, setLobbyError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    try {
      setPayload(await loadStatus());
      setError(null);
    } catch (statusError) {
      setError(statusError instanceof Error ? statusError.message : "Identity-verification status is unavailable.");
    }
  }, []);

  useEffect(() => {
    let active = true;
    loadStatus()
      .then((statusPayload) => {
        if (!active) return;
        setPayload(statusPayload);
        setError(null);
      })
      .catch((statusError: unknown) => {
        if (!active) return;
        setError(statusError instanceof Error ? statusError.message : "Identity-verification status is unavailable.");
      });
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (payload?.status?.providerStatus !== "processing") return;
    const timer = window.setInterval(() => void refresh(), 4_000);
    return () => window.clearInterval(timer);
  }, [payload?.status?.providerStatus, refresh]);

  async function beginVerification() {
    const enrollmentId = payload?.status?.enrollmentId;
    const consentVersion = payload?.consentVersion;
    if (!enrollmentId || !consentVersion || !consentAccepted) return;
    setBusy(true);
    setError(null);
    try {
      const response = await fetch("/api/florida-class-d/identity-verification", {
        method: "POST",
        cache: "no-store",
        headers: { "content-type": "application/json", accept: "application/json" },
        body: JSON.stringify({
          enrollmentId,
          consentAccepted: true,
          consentVersion,
          correlationId: crypto.randomUUID(),
        }),
      });
      const result = await response.json().catch(() => ({})) as { url?: unknown; error?: unknown };
      if (!response.ok) {
        throw new Error(typeof result.error === "string" ? result.error : "Identity verification could not be started.");
      }
      if (typeof result.url === "string" && result.url.startsWith("https://")) {
        window.location.assign(result.url);
        return;
      }
      await refresh();
    } catch (startError) {
      setError(startError instanceof Error ? startError.message : "Identity verification could not be started.");
    } finally {
      setBusy(false);
    }
  }

  const status = payload?.status;
  const providerVerified = status?.providerStatus === "verified" &&
    status.documentCheckStatus === "verified" && status.selfieCheckStatus === "verified";
  const complete = Boolean(status?.instructorAttestationRecorded && status?.identityStatus === "verified");
  const ownerUat = payload?.executionProfile === "owner_uat_noncredit";

  const loadIdentityLobby = useCallback(async () => {
    setLobbyError(null);
    const response = await fetch("/api/florida-class-d/identity-video", {
      cache: "no-store",
      headers: { accept: "application/json" },
    });
    const lobby = await response.json().catch(() => ({})) as IdentityLobbyAccess & { error?: unknown };
    if (!response.ok || typeof lobby.joinUrl !== "string" || !lobby.joinUrl.startsWith("https://")) {
      throw new Error(typeof lobby.error === "string" ? lobby.error : "The protected identity video lobby is unavailable.");
    }
    setIdentityLobby(lobby);
  }, []);

  useEffect(() => {
    if (!providerVerified || complete || identityLobby?.joinUrl) return;
    const timer = window.setTimeout(() => {
      void loadIdentityLobby().catch((lobbyLoadError) => {
        setLobbyError(lobbyLoadError instanceof Error ? lobbyLoadError.message : "The protected identity video lobby is unavailable.");
      });
    }, 0);
    return () => window.clearTimeout(timer);
  }, [complete, identityLobby?.joinUrl, loadIdentityLobby, providerVerified]);

  if (!payload && !error) {
    return <div className="fl-classd__notice"><span>Loading controlled identity status…</span></div>;
  }

  return (
    <section className="fl-classd__section" aria-live="polite">
      {ownerUat ? (
        <div className="fl-classd__notice">
          <strong>Live provider · non-credit owner UAT.</strong>
          <span>Your government ID and selfie are processed by Stripe&apos;s hosted live verification service. This acceptance record cannot grant training credit, completion, LIAS reporting, or represent FDACS approval.</span>
        </div>
      ) : null}
      {error ? <div className="fl-classd__notice"><strong>Access remains locked.</strong><span>{error}</span></div> : null}

      {!status?.enrollmentId ? (
        <div className="fl-classd__notice">
          <strong>No eligible Class D enrollment was found.</strong>
          <span>Identity verification is available only after a regulated pre-enrollment record has been created.</span>
        </div>
      ) : complete ? (
        <div className="fl-classd__notice">
          <strong>Identity control complete.</strong>
          <span>The automated government-ID and matching-selfie result and the assigned Class DI instructor attestation are recorded. Daily instructor check-in is still required before each training day.</span>
          <Link href="/florida-security-training/access">Continue to controlled course access</Link>
        </div>
      ) : providerVerified ? (
        <div className="fl-classd__identity-lobby">
          <div className="fl-classd__notice" role="status">
            <strong>Automated verification complete; assigned-instructor video verification pending.</strong>
            <span>Join the protected lobby with your U.S. state or federal photo ID. Only the licensed Class DI instructor assigned to your cohort may complete this verification.</span>
          </div>
          {lobbyError ? (
            <div className="fl-classd__notice" role="alert">
              <strong>Video verification remains locked.</strong>
              <span>{lobbyError}</span>
              <button type="button" onClick={() => void loadIdentityLobby().catch((lobbyLoadError) => setLobbyError(lobbyLoadError instanceof Error ? lobbyLoadError.message : "The protected identity video lobby is unavailable."))}>Retry protected video</button>
            </div>
          ) : null}
          {identityLobby?.joinUrl ? (
            <div className="fl-classd__identity-video">
              <iframe
                title="Protected Florida Class D photo-identification video lobby"
                src={identityLobby.joinUrl}
                allow="camera; microphone; fullscreen; autoplay"
                referrerPolicy="no-referrer"
              />
              <p>
                This lobby records no instructional time or attendance credit, and recording is disabled. Stripe retains the hosted ID and selfie images; the LMS stores only minimized provider references, signed instructor attestations, timestamps, and integrity evidence.
              </p>
            </div>
          ) : !lobbyError ? <p role="status">Opening the protected identity video lobby…</p> : null}
          <button type="button" onClick={() => void refresh()}>Refresh verification status</button>
        </div>
      ) : (
        <div className="fl-classd__automation-grid">
          <div>
            <b>1</b>
            <span>Use Stripe&apos;s hosted verification to submit a government photo ID and matching selfie. The verification occurs on Stripe&apos;s controlled service.</span>
          </div>
          <div>
            <b>2</b>
            <span>OBSERRA EXECUTIVE PROTECTION &amp; INTELLIGENCE LLC stores the provider session reference, outcome, timestamps, and signed instructor attestations—not copies of the ID, selfie, or a biometric template.</span>
          </div>
          <div>
            <b>3</b>
            <span>Your assigned licensed Class DI instructor must personally observe you and the qualifying U.S. state or federal photo ID before course access.</span>
          </div>
          <label>
            <input
              type="checkbox"
              checked={consentAccepted}
              onChange={(event) => setConsentAccepted(event.target.checked)}
            />
            <span>I consent to Stripe collecting and processing my government-ID image and selfie for identity verification, and I understand the LMS retains only the limited verification evidence described above.</span>
          </label>
          <button
            type="button"
            disabled={!consentAccepted || busy || !payload?.verificationEnabled}
            onClick={() => void beginVerification()}
          >
            {busy ? "Opening secure verification…" : status?.providerStatus === "requires_input" ? "Resume secure verification" : "Start secure identity verification"}
          </button>
          {!payload?.verificationEnabled ? <p>Verification remains fail-closed until controlled production, synthetic acceptance, or the restricted owner UAT runtime is authorized.</p> : null}
        </div>
      )}
    </section>
  );
}
