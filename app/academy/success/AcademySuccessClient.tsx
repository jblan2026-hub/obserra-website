"use client";

import { SignUp, useUser } from "@clerk/nextjs";
import { useEffect, useMemo, useState } from "react";

type SuccessParams = { course?: string; session_id?: string };

function AuthenticatedAccessFlow({ params }: { params: SuccessParams }) {
  const { isLoaded, isSignedIn } = useUser();
  const [state, setState] = useState("Confirming your secure payment.");
  const returnUrl = useMemo(() => {
    const query = new URLSearchParams();
    if (params.course) query.set("course", params.course);
    if (params.session_id) query.set("session_id", params.session_id);
    return `/academy/success?${query.toString()}`;
  }, [params.course, params.session_id]);

  useEffect(() => {
    if (!isLoaded || !isSignedIn || !params.course || !params.session_id) return;
    const courseId = params.course;
    const checkoutSessionId = params.session_id;
    const claim = async () => {
      setState("Verifying your confirmed payment and unlocking course access.");
      const response = await fetch(`/api/academy/claim-purchase?course=${encodeURIComponent(courseId)}&session_id=${encodeURIComponent(checkoutSessionId)}`, { cache: "no-store" });
      if (response.ok) {
        window.location.assign(`/academy/learn/${courseId}`);
        return;
      }
      const result = await response.json().catch(() => ({ error: "Payment verification is temporarily unavailable" })) as { error?: string };
      setState(result.error ?? "Payment verification is temporarily unavailable. Please try again shortly.");
    };
    void claim();
  }, [isLoaded, isSignedIn, params.course, params.session_id]);

  const validReference = Boolean(params.course && params.session_id);
  return <main className="auth-shell"><section className="auth-card"><p className="auth-kicker">OBSERRA ACADEMY</p><h1>Payment received.</h1>{!validReference ? <p>Your checkout reference is incomplete. Please return to the Academy catalog and contact Obserra if you need assistance.</p> : !isLoaded ? <p>Preparing secure Academy access.</p> : !isSignedIn ? <><p>Create your separate Academy account with the same email address used at checkout. Your payment remains verified by Stripe; the account only unlocks the course after the email match is confirmed.</p><SignUp routing="path" path="/sign-up" signInUrl={`/sign-in?redirect_url=${encodeURIComponent(returnUrl)}`} fallbackRedirectUrl={returnUrl} /><p className="auth-help">Already have an Academy account? <a href={`/sign-in?redirect_url=${encodeURIComponent(returnUrl)}`}>Sign in to unlock your course.</a></p></> : <p>{state}</p>}<p className="auth-help">Need assistance? <a href="mailto:info@obserrallc.com?subject=Obserra%20Academy%20Enrollment%20Support">Contact Obserra Academy</a>.</p></section></main>;
}

export default function AcademySuccessClient({ params, authenticationReady }: { params: SuccessParams; authenticationReady: boolean }) {
  if (!authenticationReady) {
    return <main className="auth-shell"><section className="auth-card"><p className="auth-kicker">OBSERRA ACADEMY</p><h1>Academy access is being configured.</h1><p>Your payment is not converted into access until secure account verification is available. Please contact Obserra Academy for assistance.</p><p className="auth-help"><a href="mailto:info@obserrallc.com?subject=Obserra%20Academy%20Enrollment%20Support">Contact Obserra Academy</a></p></section></main>;
  }
  return <AuthenticatedAccessFlow params={params} />;
}
