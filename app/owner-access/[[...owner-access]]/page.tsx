import { SignIn } from "@clerk/nextjs";
import { auth } from "@clerk/nextjs/server";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ownerUserIdAllowed } from "../../../lib/owner-auth";

export const metadata: Metadata = {
  title: "Owner Access | Obserra Command Center",
  description: "Private owner identity gateway for the Obserra Command Center.",
  robots: { index: false, follow: false, noarchive: true, nosnippet: true },
};

function safeRedirect(value: string | string[] | undefined) {
  const candidate = Array.isArray(value) ? value[0] : value;
  if (!candidate || !candidate.startsWith("/command-center") || candidate.startsWith("//")) {
    return "/command-center";
  }
  return candidate;
}

export default async function OwnerAccessPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const redirectUrl = safeRedirect(params.redirect_url ?? params.redirectUrl);
  const { userId } = await auth();

  if (userId && ownerUserIdAllowed(userId)) redirect(redirectUrl);
  if (userId) notFound();

  return (
    <main className="auth-shell">
      <header className="auth-header">
        <Link href="/" aria-label="Obserra home">
          <Image
            src="/brand/obserra-logo.png"
            alt="Obserra Executive Protection and Intelligence LLC"
            width={286}
            height={55}
            priority
          />
        </Link>
        <span>PRIVATE OWNER GATEWAY</span>
      </header>
      <section className="auth-layout">
        <div className="auth-copy">
          <p className="eyebrow">OBSERRA OWNER COMMAND CENTER</p>
          <h1>Verify the registered owner identity.</h1>
          <p>
            This gateway authenticates a Clerk session and then binds access to the single server-configured
            owner user ID. Email addresses are not used as an authorization decision.
          </p>
          <div className="auth-assurance">
            <span>Exact owner identity binding</span>
            <span>Server-side authorization</span>
            <span>No public navigation link</span>
            <span>No email allowlist</span>
          </div>
        </div>
        <div className="auth-panel">
          <SignIn
            routing="path"
            path="/owner-access"
            forceRedirectUrl={redirectUrl}
            fallbackRedirectUrl={redirectUrl}
          />
        </div>
      </section>
      <p className="auth-note">
        Authorized owner access only. Authentication and owner authorization decisions are logged by the
        configured identity and application services.
      </p>
    </main>
  );
}
