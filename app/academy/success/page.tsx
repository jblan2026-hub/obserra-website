"use client";

import { useEffect, useState } from "react";

export default function AcademySuccessPage({ searchParams }: { searchParams: Promise<{ course?: string }> }) {
  const [course, setCourse] = useState<string | undefined>();
  const [state, setState] = useState("Confirming your secure payment and course access.");
  useEffect(() => { searchParams.then((params) => setCourse(params.course)); }, [searchParams]);
  useEffect(() => {
    if (!course) return;
    let attempts = 0;
    const poll = async () => {
      const response = await fetch(`/api/academy/enrollment-status?course=${course}`, { cache: "no-store" });
      const result = await response.json() as { enrolled?: boolean };
      if (result.enrolled) { window.location.assign(`/academy/learn/${course}`); return; }
      attempts += 1;
      setState(attempts < 12 ? "Payment received. Verifying enrollment now." : "Payment has been received. Enrollment verification is still processing. Please refresh this page in a moment.");
      if (attempts < 12) window.setTimeout(poll, 2500);
    };
    void poll();
  }, [course]);
  return <main className="auth-shell"><section className="success-card"><img src="/brand/obserra-logo.png" alt="Obserra Executive Protection and Intelligence LLC" /><h1>Welcome to Obserra Academy.</h1><p>{state}</p></section></main>;
}
