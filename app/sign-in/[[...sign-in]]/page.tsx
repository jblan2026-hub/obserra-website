import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { SignIn } from "@clerk/nextjs";

export const metadata: Metadata = {
  title: "Sign In | Obserra Customer Portal",
  description: "Sign in securely to access Obserra Academy, customer services, licensing, reports, and support.",
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
          <p className="eyebrow">SECURE CUSTOMER ACCESS</p>
          <h1>Sign in to your Obserra account.</h1>
          <p>Access customer services through a governed identity boundary designed for account integrity, least privilege, protected transactions, and auditable access.</p>
          <div className="auth-assurance">
            <span>Protected customer portal</span><span>Account based Academy access</span><span>Secure purchase workflows</span><span>Enterprise identity ready</span>
          </div>
        </div>
        <div className="auth-panel"><SignIn routing="path" path="/sign-in" signUpUrl="/sign-up" fallbackRedirectUrl="/portal" /></div>
      </section>
      <p className="auth-note">Authorized access only. Authentication activity may be logged for security, fraud prevention, support, and compliance purposes.</p>
    </main>
  );
}
