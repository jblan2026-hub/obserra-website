import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getInternalOwnerAuthority } from "@/lib/auth/authority-repository";
import { safeRelativeRedirect } from "@/lib/auth/redirects";
import { prepareSupabaseAuthRuntime } from "@/lib/auth/runtime-config";
import { LEGAL_ENTITY_NAME } from "@/lib/legal-identity";
import { isProductionRuntime } from "@/lib/runtime-environment";
import MfaChallenge from "./MfaChallenge";

export const metadata: Metadata = {
  title: `Multi-Factor Verification | ${LEGAL_ENTITY_NAME}`,
  robots: { index: false, follow: false },
};

export default async function MfaPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const redirectUrl = safeRelativeRedirect(params.redirect_url ?? params.redirectUrl);
  const authority = await getInternalOwnerAuthority();
  if (!authority.identity) {
    redirect(`/sign-in?redirect_url=${encodeURIComponent(redirectUrl)}`);
  }
  const runtime = prepareSupabaseAuthRuntime();

  return (
    <main className="auth-shell">
      <header className="auth-header">
        <Link href="/" aria-label={`${LEGAL_ENTITY_NAME} home`}>
          <Image src="/brand/obserra-logo.png" alt="OBSERRA EXECUTIVE PROTECTION & INTELLIGENCE LLC" width={286} height={55} priority />
        </Link>
        <Link href="/trust">Trust Center</Link>
      </header>
      <section className="auth-layout">
        <div className="auth-copy">
          <p className="eyebrow">SECURE IDENTITY VERIFICATION</p>
          <h1>Complete multi-factor verification.</h1>
          <p>Internal owner access requires a current, independently verified second factor.</p>
        </div>
        <div className="auth-panel">
          {runtime.ready ? (
            <MfaChallenge
              allowEnrollment={authority.mfaEnrollmentReady}
              redirectUrl={redirectUrl}
              runtime={{
                ready: runtime.ready,
                url: runtime.url,
                projectRef: runtime.projectRef,
                publishableKey: runtime.publishableKey,
                production: isProductionRuntime(),
              }}
            />
          ) : (
            <div role="alert"><h2>Identity service unavailable</h2><p>Access remains closed.</p></div>
          )}
        </div>
      </section>
      <p className="auth-note">Verification activity is recorded for account security and access governance.</p>
    </main>
  );
}
