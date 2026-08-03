import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
  return <main className="auth-shell">
    <section className="auth-card">
      <p className="auth-kicker">OBSERRA ACADEMY</p>
      <h1>Create your Academy account</h1>
      <p>After payment is confirmed, create your secure Academy account with the same email address used at checkout to unlock your course.</p>
      <SignUp routing="path" path="/sign-up" signInUrl="/sign-in" fallbackRedirectUrl="/academy" />
      <p className="auth-help">Need assistance? <a href="mailto:info@obserrallc.com?subject=Obserra%20Academy%20Learner%20Access">Contact Obserra Academy</a>.</p>
    </section>
  </main>;
}
