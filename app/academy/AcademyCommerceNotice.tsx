const MESSAGES: Record<string, { title: string; detail: string; alert?: boolean }> = {
  cancelled: { title: "Checkout canceled", detail: "No new charge was created. You can restart secure checkout when ready." },
  "licensing-pending": { title: "Academy LMS is live; new enrollment is not yet open", detail: "Course previews and existing learner access remain available. New enrollment and payment stay disabled until the required licensing is complete and the sales gate is explicitly enabled." },
  "configuration-required": { title: "Checkout is temporarily unavailable", detail: "The payment boundary is not fully configured. No charge was attempted.", alert: true },
  "identity-configuration-required": { title: "Sign-in service unavailable", detail: "Paid access cannot be connected to a learner identity right now. No additional charge will be created.", alert: true },
  "durable-storage-unavailable": { title: "Enrollment recording unavailable", detail: "Checkout is paused until durable entitlement storage is healthy. No charge was attempted.", alert: true },
  "purchaser-identity-storage-unavailable": { title: "Purchaser verification unavailable", detail: "Guest checkout is paused until purchaser identity protection is healthy. No charge was attempted.", alert: true },
  "already-enrolled": { title: "Course access already active", detail: "Open the course from your learner portal. A duplicate checkout was not created." },
  "course-unavailable": { title: "New enrollment is paused", detail: "This course cannot accept a new purchase. Existing learner access is preserved." },
  "purchase-authorization-unavailable": { title: "Purchase authorization unavailable", detail: "The catalog control plane could not authorize a new purchase. No charge was attempted.", alert: true },
  "checkout-unavailable": { title: "Secure checkout did not open", detail: "No charge was created. Please wait and try again." },
  invalid: { title: "Payment return could not be validated", detail: "Restart checkout from the published course page.", alert: true },
  "payment-pending": { title: "Payment is still pending", detail: "Stripe has not reported a paid result. Wait a moment, then confirm access again." },
  "payment-processing": { title: "Payment received, access is processing", detail: "The signed payment event has not finished recording. Retry below without creating another charge." },
  "payment-expired": { title: "Checkout session expired", detail: "No paid access was recorded. Start a new secure checkout from this course page." },
  "verification-failed": { title: "Payment verification failed", detail: "No entitlement was granted. Contact support if Stripe shows a completed charge.", alert: true },
  "verification-unavailable": { title: "Payment verification unavailable", detail: "No entitlement change was made. Wait and retry access confirmation.", alert: true },
  "claim-email-mismatch": { title: "Purchaser identity did not match", detail: "Sign in with the verified email used at checkout or contact support. Access was not granted.", alert: true },
};

export default function AcademyCommerceNotice({ status, courseId, sessionId }: { status?: string; courseId?: string; sessionId?: string }) {
  const message = status ? MESSAGES[status] : null;
  if (!message) return null;
  const canRetry = Boolean(courseId && sessionId && ["payment-pending", "payment-processing", "verification-unavailable"].includes(status ?? ""));
  return (
    <section className={`academy-commerce-notice${message.alert ? " academy-commerce-notice--alert" : ""}`} role={message.alert ? "alert" : "status"}>
      <strong>{message.title}</strong>
      <p>{message.detail}</p>
      {canRetry ? (
        <form action="/api/academy/redeem" method="post">
          <input type="hidden" name="course" value={courseId} />
          <input type="hidden" name="session_id" value={sessionId} />
          <button type="submit">Retry access confirmation</button>
        </form>
      ) : null}
    </section>
  );
}
