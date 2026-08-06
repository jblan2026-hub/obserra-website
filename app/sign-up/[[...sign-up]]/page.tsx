import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { SignUp } from "@clerk/nextjs";

export const metadata: Metadata = {
  title: "Create Passwordless Account | Obserra Customer Portal",
  description: "Create an Obserra account using verified email, a passkey, or an approved enterprise identity provider without establishing a password.",
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
          <p className="eyebrow">CREATE A PASSWORDLESS ACCOUNT</p>
          <h1>Establish your Obserra identity without a password.</h1>
          <p>Verify your email, register a passkey when available, or use an approved enterprise identity provider for Academy enrollment, protected services, support, and licensed application access.</p>
          <div className="auth-assurance">
            <span>Verified email enrollment</span><span>Passkey ready</span><span>Protected session management</span><span>Enterprise federation ready</span>
          </div>
        </div>
        <div className="auth-panel"><SignUp routing="path" path="/sign-up" signInUrl="/sign-in" fallbackRedirectUrl="/portal" /></div>
      </section>
      <p className="auth-note">Create an account only for yourself or for an identity you are authorized to administer. Passwordless account activity may be logged for security and support.</p>
    </main>
  );
}
