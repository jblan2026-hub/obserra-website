import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { SignUp } from "@clerk/nextjs";

export const metadata: Metadata = {
  title: "Create Account | Obserra Customer Portal",
  description: "Create a secure Obserra account for Academy enrollment, customer services, licensing, reports, and support.",
  robots: { index: false, follow: false },
};

export default function SignUpPage() {
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
          <p className="eyebrow">CREATE YOUR SECURE ACCOUNT</p>
          <h1>Establish your Obserra identity.</h1>
          <p>Create one account for Academy enrollment, protected customer services, enterprise support, and future licensed application access.</p>
          <div className="auth-assurance">
            <span>Email verification</span><span>Protected session management</span><span>Account based completion records</span><span>Enterprise federation ready</span>
          </div>
        </div>
        <div className="auth-panel"><SignUp routing="path" path="/sign-up" signInUrl="/sign-in" fallbackRedirectUrl="/portal" /></div>
      </section>
      <p className="auth-note">Create an account only for yourself or for an identity you are authorized to administer. Account activity may be logged for security and support.</p>
    </main>
  );
}
