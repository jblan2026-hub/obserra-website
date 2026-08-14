"use client";

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
  return (
    <form
      action="/api/academy/checkout"
      method="post"
      style={{ display: "contents" }}
      onSubmit={() => track("academy_checkout_started", { course: courseId, source })}
    >
      <input type="hidden" name="course" value={courseId} />
      <button type="submit" className={className}>
        {label}
      </button>
    </form>
  );
}
