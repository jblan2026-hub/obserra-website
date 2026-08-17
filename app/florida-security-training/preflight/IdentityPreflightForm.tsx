"use client";

import Link from "next/link";
import { useState, useSyncExternalStore } from "react";
import { Camera, CheckCircle2, IdCard, LockKeyhole, MonitorSmartphone, ShieldCheck } from "lucide-react";

const items = [
  ["photoId", IdCard, "Government photo ID available", "I have an unexpired government-issued photo ID available for hosted verification and the live instructor identity check."],
  ["legalName", ShieldCheck, "Legal identity will match", "I will use the same legal identity in enrollment and identity verification."],
  ["hosted", Camera, "Hosted ID and selfie verification", "I understand the protected identity flow uses hosted government-ID and matching-selfie verification."],
  ["instructor", ShieldCheck, "Live instructor identity verification", "I understand the assigned licensed Class DI instructor must independently verify my identity before regulated course access."],
  ["singleDevice", MonitorSmartphone, "One-device course access", "I understand the online course may be used from only one device at a time."],
] as const;

type Key = typeof items[number][0];

const subscribeToStaticBrowserCapability = () => () => {};

export default function IdentityPreflightForm() {
  const [checks, setChecks] = useState<Record<Key, boolean>>({ photoId: false, legalName: false, hosted: false, instructor: false, singleDevice: false });
  const capabilitiesKnown = useSyncExternalStore(subscribeToStaticBrowserCapability, () => true, () => false);
  const secure = useSyncExternalStore(subscribeToStaticBrowserCapability, () => window.isSecureContext, () => false);
  const media = useSyncExternalStore(
    subscribeToStaticBrowserCapability,
    () => Boolean(navigator.mediaDevices?.getUserMedia),
    () => false,
  );

  const acknowledged = Object.values(checks).every(Boolean);
  const ready = capabilitiesKnown && acknowledged && secure && media;

  return (
    <section className="fl-classd__section fl-classd__identity-shell">
      <div className="fl-classd__automation-grid">
        <div><b>{secure ? <CheckCircle2 size={16} /> : <LockKeyhole size={16} />}</b><span><strong>Secure browser</strong>{!capabilitiesKnown ? "Checking…" : secure ? "HTTPS secure context detected." : "HTTPS is required."}</span></div>
        <div><b>{media ? <CheckCircle2 size={16} /> : <Camera size={16} />}</b><span><strong>Camera-capable browser</strong>{!capabilitiesKnown ? "Checking…" : media ? "Camera and microphone APIs are available." : "Camera/microphone browser support is required."}</span></div>
      </div>

      <div className="fl-classd__identity-preflight-list">
        {items.map(([key, Icon, title, detail]) => (
          <label key={key} className={checks[key] ? "is-complete" : ""}>
            <input type="checkbox" checked={checks[key]} onChange={(event) => setChecks((current) => ({ ...current, [key]: event.target.checked }))} />
            <Icon size={20} aria-hidden="true" />
            <span><strong>{title}</strong><small>{detail}</small></span>
          </label>
        ))}
      </div>

      <div className="fl-classd__notice"><ShieldCheck size={20} /><div><strong>This is a readiness gate, not identity verification.</strong><span>No PII, ID image, biometric template, enrollment, payment, attendance, instructional time, exam result, completion, certificate, or LIAS record is created here.</span></div></div>
      {!ready && capabilitiesKnown ? <div className="fl-classd__notice is-locked"><LockKeyhole size={20} /><div><strong>Student sign-in remains locked from this flow.</strong><span>Complete every requirement on a secure camera-capable device.</span></div></div> : null}
      <div className="fl-classd__actions">
        {ready ? <Link href={`/sign-in?redirect_url=${encodeURIComponent("/florida-security-training/enroll")}`}>Continue to protected student account</Link> : <span aria-disabled="true">Complete all ID checks to continue</span>}
        <Link className="secondary" href="/florida-security-training">Return to course information</Link>
      </div>
    </section>
  );
}
