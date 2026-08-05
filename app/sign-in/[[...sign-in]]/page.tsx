import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { SignIn } from "@clerk/nextjs";

export const metadata: Metadata = {
  title: "Learner Sign In",
  description: "Sign in to purchase and access Obserra Academy professional training.",
  robots: { index: false, follow: false },
};

export default function SignInPage() {
  return (
    <main className="auth-shell">
      <section className="auth-card">
        <Link href="/academy" aria-label="Return to Obserra Academy">
          <Image src="/brand/obserra-logo.png" width={240} height={46} alt="Obserra Academy" />
        </Link>
        <p className="auth-kicker">SECURE LEARNER ACCESS</p>
        <h1>Sign in to continue your enrollment.</h1>
        <p>
          Create or access your learner account to complete secure payment, unlock your selected course,
          save progress across devices, complete the final assessment, and generate your certificate.
        </p>
        <SignIn
          routing="path"
          path="/sign-in"
          fallbackRedirectUrl="/academy"
          signUpUrl="/sign-up"
        />
        <p className="auth-help">
          Your account is used only to manage enrollment, course access, progress, and completion records. Need help?{" "}
          <a href="mailto:info@obserrallc.com?subject=Obserra%20Academy%20Learner%20Access">Contact Obserra Academy</a>.
        </p>
      </section>
    </main>
  );
}
