import { SignIn } from "@clerk/nextjs";
import { auth } from "@clerk/nextjs/server";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { AcademyControlError, verifyAcademyOwner } from "../../../lib/academy-control";
import OwnerBootstrapClient from "./OwnerBootstrapClient";
import styles from "./owner-access.module.css";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Owner Access | Obserra Command Center",
  description: "Private identity gateway for the Obserra company owner Command Center.",
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
  const session = await auth();
  let bootstrapRequired = params.bootstrap === "required";

  if (session.userId) {
    const token = await session.getToken();
    if (!token) notFound();
    try {
      const owner = await verifyAcademyOwner(token);
      if (owner.ownerUserId !== session.userId) notFound();
      redirect(redirectUrl);
    } catch (error) {
      if (error instanceof AcademyControlError) {
        if (error.code === "OWNER_BOOTSTRAP_REQUIRED") bootstrapRequired = true;
        else if (error.status === 401 || error.status === 403) notFound();
        else throw error;
      } else {
        throw error;
      }
    }
  }

  return (
    <main className={styles.shell}>
      <header className={styles.header}>
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

      <section className={styles.layout}>
        <div className={styles.copy}>
          <p className={styles.eyebrow}>OBSERRA OWNER COMMAND CENTER</p>
          <h1>Authenticate the company owner identity.</h1>
          <p>
            Clerk establishes the signed-in session. The private control service then authorizes exactly one
            immutable Clerk user ID and issuer. No email address is used as an authorization decision.
          </p>
          <div className={styles.assurance}>
            <span>Exact owner ID binding</span>
            <span>One-time bootstrap proof</span>
            <span>Server-side authorization</span>
            <span>No public navigation link</span>
            <span>No email allowlist</span>
          </div>
        </div>

        <div className={styles.panel}>
          {session.userId && bootstrapRequired ? (
            <OwnerBootstrapClient redirectUrl={redirectUrl} />
          ) : (
            <SignIn
              routing="path"
              path="/owner-access"
              forceRedirectUrl={redirectUrl}
              fallbackRedirectUrl={redirectUrl}
            />
          )}
        </div>
      </section>

      <p className={styles.note}>
        Authorized company-owner access only. All owner course changes are revision controlled and audited.
      </p>
    </main>
  );
}
