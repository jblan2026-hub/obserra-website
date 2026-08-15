import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { SignUp } from "@clerk/nextjs";
import { identityProviderForRequest } from "@/lib/auth/provider-routing";
import { safeRelativeRedirect } from "@/lib/auth/redirects";
import { prepareSupabaseAuthRuntime } from "@/lib/auth/runtime-config";
import { LEGAL_ENTITY_NAME } from "@/lib/legal-identity";

export const metadata: Metadata = {
  title: `Create Account | ${LEGAL_ENTITY_NAME} Customer Portal`,
  description: `Create a secure ${LEGAL_ENTITY_NAME} account for Academy enrollment, customer services, licensing, reports, and support.`,
  robots: { index: false, follow: false },
};

export default async function SignUpPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const redirectUrl = safeRelativeRedirect(params.redirect_url ?? params.redirectUrl);
  const ownership = identityProviderForRequest({ pathname: "/sign-up", redirectTarget: redirectUrl });
  const supabaseRuntime = prepareSupabaseAuthRuntime();
  const useSupabase = ownership.provider === "supabase" && supabaseRuntime.runtimeEnabled;

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
          <p className="eyebrow">CREATE YOUR SECURE ACCOUNT</p>
          <h1>Establish your {LEGAL_ENTITY_NAME} identity.</h1>
          <p>Create one account for Academy enrollment, protected customer services, enterprise support, and future licensed application access.</p>
          <div className="auth-assurance">
            <span>Email verification</span><span>Protected session management</span><span>Account based completion records</span><span>Enterprise federation ready</span>
          </div>
        </div>
        <div className="auth-panel">
          {useSupabase ? (
            <div>
              <p className="eyebrow">INVITATION REQUIRED</p>
              <h2>Invitation required</h2>
              <p>{LEGAL_ENTITY_NAME} identity accounts are provisioned only for approved internal personnel. Public registration is closed.</p>
              <Link href={`/sign-in?redirect_url=${encodeURIComponent(redirectUrl)}`}>Return to sign in</Link>
              {!supabaseRuntime.ready ? <p role="alert">Identity configuration is unavailable. Access remains closed.</p> : null}
            </div>
          ) : (
            <SignUp
              routing="path"
              path="/sign-up"
              signInUrl="/sign-in"
              forceRedirectUrl={redirectUrl}
              fallbackRedirectUrl={redirectUrl}
            />
          )}
        </div>
      </section>
      <p className="auth-note">Create an account only for yourself or for an identity you are authorized to administer. Account activity may be logged for security and support.</p>
    </main>
  );
}
