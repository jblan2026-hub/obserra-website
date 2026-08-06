import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { SignIn } from "@clerk/nextjs";

export const metadata: Metadata = {
  title: "Passwordless Sign In | Obserra Customer Portal",
  description: "Sign in to Obserra using a passkey, verified email code, secure email link, or approved enterprise identity provider.",
  robots: { index: false, follow: false },
};

export default function SignInPage() {
  return (
    <main className="auth-shell">
      <header className="auth-header">
        <Link href="/" aria-label="Obserra home">
          <Image src="/brand/obserra-logo.png" alt="Obserra Executive Protection and Intelligence LLC" width={286} height={55} priority />
        </Link>
        <Link href="/trust">Trust Center</Link>
      </header>
      <section className="auth-layout">
        <div className="auth-copy">
          <p className="eyebrow">PASSWORDLESS CUSTOMER ACCESS</p>
          <h1>Sign in without a password.</h1>
          <p>Use a passkey, verified email code, secure email link, or approved enterprise identity provider. Obserra does not require a username-and-password credential for customer access.</p>
          <div className="auth-assurance">
            <span>Passkey ready</span><span>Verified email access</span><span>Phishing-resistant authentication</span><span>Enterprise federation ready</span>
          </div>
        </div>
        <div className="auth-panel"><SignIn routing="path" path="/sign-in" signUpUrl="/sign-up" fallbackRedirectUrl="/portal" /></div>
      </section>
      <p className="auth-note">Authorized access only. Passwordless authentication activity may be logged for security, fraud prevention, support, and compliance purposes.</p>
    </main>
  );
}
