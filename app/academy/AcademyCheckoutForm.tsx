"use client";

import { useState } from "react";
import { track } from "@vercel/analytics";

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
      <button type="submit" className={className} disabled={submitting} aria-describedby={`checkout-state-${courseId}-${source}`}>
        {submitting ? "Opening secure checkout…" : label}
      </button>
      <span id={`checkout-state-${courseId}-${source}`} className="academy-checkout-state" aria-live="polite">
        {submitting ? "Connecting to Stripe. Do not refresh or submit again." : "Payment is completed on Stripe's hosted checkout."}
      </span>
    </form>
  );
}
