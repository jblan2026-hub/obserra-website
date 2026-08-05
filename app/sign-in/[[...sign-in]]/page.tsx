import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return <main className="auth-shell">
    <section className="auth-card">
      <p className="auth-kicker">OBSERRA ACADEMY</p>
      <h1>Protected owner access</h1>
      <p>This private sign-in is only for the Obserra owner control room. Configure Clerk for passwordless sign-in (passkey or email link) and disable password strategies if you want no username/password login.</p>
      <SignIn routing="path" path="/sign-in" fallbackRedirectUrl="/admin" />
      <p className="auth-help">Need assistance? <a href="mailto:info@obserrallc.com?subject=Obserra%20Academy%20Learner%20Access">Contact Obserra Academy</a>.</p>
    </section>
  </main>;
}
