import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { SignIn } from "@clerk/nextjs";
import { identityProviderForRequest } from "@/lib/auth/provider-routing";
import { safeRelativeRedirect } from "@/lib/auth/redirects";
import { prepareSupabaseAuthRuntime } from "@/lib/auth/runtime-config";
import { LEGAL_ENTITY_NAME } from "@/lib/legal-identity";
import SupabaseSignInForm from "./SupabaseSignInForm";

export const metadata: Metadata = {
  title: `Sign In | ${LEGAL_ENTITY_NAME} Customer Portal`,
  description: "Sign in securely to access Obserra Academy, customer services, licensing, reports, and support.",
  robots: { index: false, follow: false },
};

export default async function SignInPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const redirectUrl = safeRelativeRedirect(params.redirect_url ?? params.redirectUrl);
  const ownership = identityProviderForRequest({ pathname: "/sign-in", redirectTarget: redirectUrl });
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
          <p className="eyebrow">SECURE CUSTOMER ACCESS</p>
          <h1>Sign in to your {LEGAL_ENTITY_NAME} account.</h1>
          <p>Access customer services through a governed identity boundary designed for account integrity, least privilege, protected transactions, and auditable access.</p>
          <div className="auth-assurance">
            <span>Protected customer portal</span><span>Account based Academy access</span><span>Secure purchase workflows</span><span>Enterprise identity ready</span>
          </div>
        </div>
        <div className="auth-panel">
          {useSupabase ? (
            supabaseRuntime.ready ? (
              <SupabaseSignInForm
                redirectUrl={redirectUrl}
                runtime={{
                  ready: supabaseRuntime.ready,
                  url: supabaseRuntime.url,
                  projectRef: supabaseRuntime.projectRef,
                  publishableKey: supabaseRuntime.publishableKey,
                  production: process.env.VERCEL_ENV === "production",
                }}
              />
            ) : (
              <div role="alert">
                <h2>Identity service unavailable</h2>
                <p>Secure sign-in is not configured. Access remains closed.</p>
              </div>
            )
          ) : (
            <SignIn
              routing="path"
              path="/sign-in"
              signUpUrl="/sign-up"
              forceRedirectUrl={redirectUrl}
              fallbackRedirectUrl={redirectUrl}
            />
          )}
        </div>
      </section>
      <p className="auth-note">Authorized access only. Authentication activity may be logged for security, fraud prevention, support, and compliance purposes.</p>
    </main>
  );
}
