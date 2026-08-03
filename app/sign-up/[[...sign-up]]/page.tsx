import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
  return <main className="auth-shell">
    <section className="auth-card">
      <p className="auth-kicker">OBSERRA ACADEMY</p>
      <h1>Create your learner account</h1>
      <p>Create your secure account before starting paid professional training.</p>
      <SignUp routing="path" path="/sign-up" signInUrl="/sign-in" fallbackRedirectUrl="/academy" />
      <p className="auth-help">Need assistance? <a href="mailto:info@obserrallc.com?subject=Obserra%20Academy%20Learner%20Access">Contact Obserra Academy</a>.</p>
    </section>
  </main>;
}
