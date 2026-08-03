import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return <main className="auth-shell">
    <section className="auth-card">
      <p className="auth-kicker">OBSERRA ACADEMY</p>
      <h1>Secure learner access</h1>
      <p>Sign in to access paid training, learning progress, and your Obserra Certificate of Training.</p>
      <SignIn routing="path" path="/sign-in" signUpUrl="/sign-up" fallbackRedirectUrl="/academy" />
      <p className="auth-help">Need assistance? <a href="mailto:info@obserrallc.com?subject=Obserra%20Academy%20Learner%20Access">Contact Obserra Academy</a>.</p>
    </section>
  </main>;
}
