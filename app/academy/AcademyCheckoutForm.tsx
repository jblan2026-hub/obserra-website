"use client";

import { useEffect, useState } from "react";
import { track } from "@vercel/analytics";

type CheckoutAttempt = { id: string; issuedAt: number };

const ATTEMPT_MAX_AGE_SECONDS = 22 * 60 * 60;
const ATTEMPT_STORAGE_PREFIX = "obserra:academy-checkout-attempt:v3:";
const BROWSER_STORAGE_KEY = "obserra:academy-checkout-browser:v1";
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function validAttempt(value: unknown, nowSeconds: number): value is CheckoutAttempt {
  if (!value || typeof value !== "object") return false;
  const candidate = value as Partial<CheckoutAttempt>;
  return typeof candidate.id === "string" &&
    UUID.test(candidate.id) &&
    Number.isSafeInteger(candidate.issuedAt) &&
    Number(candidate.issuedAt) <= nowSeconds + 90 &&
    nowSeconds - Number(candidate.issuedAt) <= ATTEMPT_MAX_AGE_SECONDS;
}

type AcademyCheckoutFormProps = {
  courseId: string;
  label: string;
  className?: string;
  source: "featured" | "catalog" | "course-detail" | "course-card";
};

export default function AcademyCheckoutForm({
  courseId,
  label,
  className,
  source,
}: AcademyCheckoutFormProps) {
  const [submitting, setSubmitting] = useState(false);
  const [attempt, setAttempt] = useState<CheckoutAttempt | null>(null);
  const [browserIdentityReady, setBrowserIdentityReady] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    const initialize = async () => {
      if (!navigator.locks) return;
      await navigator.locks.request("obserra-academy-checkout-bootstrap-v1", { mode: "exclusive" }, async () => {
        const nowSeconds = Math.floor(Date.now() / 1000);
        const storageKey = `${ATTEMPT_STORAGE_PREFIX}${courseId}`;
        let browserId: string;
        let current: CheckoutAttempt;
        try {
          const storedBrowserId = localStorage.getItem(BROWSER_STORAGE_KEY) ?? "";
          browserId = UUID.test(storedBrowserId) ? storedBrowserId.toLowerCase() : crypto.randomUUID();
          localStorage.setItem(BROWSER_STORAGE_KEY, browserId);
          const parsed = JSON.parse(localStorage.getItem(storageKey) ?? "null") as unknown;
          current = validAttempt(parsed, nowSeconds)
            ? parsed
            : { id: crypto.randomUUID(), issuedAt: nowSeconds };
          localStorage.setItem(storageKey, JSON.stringify(current));
        } catch {
          return;
        }
        const response = await fetch("/api/academy/checkout-identity", {
          method: "POST",
          cache: "no-store",
          credentials: "same-origin",
          headers: { accept: "application/json", "content-type": "application/json" },
          body: JSON.stringify({ browserId }),
          signal: controller.signal,
        }).catch(() => null);
        if (response?.ok && !controller.signal.aborted) {
          setAttempt(current);
          setBrowserIdentityReady(true);
        }
      });
    };
    void initialize();
    return () => controller.abort();
  }, [courseId]);

  return (
    <form
      action="/api/academy/checkout"
      method="post"
      style={{ display: "contents" }}
      onSubmit={() => {
        setSubmitting(true);
        track("academy_checkout_started", { course: courseId, source });
      }}
    >
      <input type="hidden" name="course" value={courseId} />
      <input type="hidden" name="checkoutAttemptId" value={attempt?.id ?? ""} />
      <input type="hidden" name="checkoutAttemptIssuedAt" value={attempt?.issuedAt ?? ""} />
      <button type="submit" className={className} disabled={submitting || !attempt || !browserIdentityReady} aria-describedby={`checkout-state-${courseId}-${source}`}>
        {submitting ? "Opening secure checkout…" : label}
      </button>
      <span id={`checkout-state-${courseId}-${source}`} className="academy-checkout-state" aria-live="polite">
        {submitting ? "Connecting to Stripe. Do not refresh or submit again." : "Payment is completed on Stripe's hosted checkout."}
      </span>
    </form>
  );
}
