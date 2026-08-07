import type { Metadata } from "next";
import Image from "next/image";
import { SignIn } from "@clerk/nextjs";
import { auth } from "@clerk/nextjs/server";
import { notFound, redirect } from "next/navigation";
import { verifyAcademyOwner } from "../../../lib/owner-access";
import OwnerBootstrapClient from "./OwnerBootstrapClient";
import styles from "./owner-access.module.css";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Owner Access | Obserra",
  description: "Private identity gateway for the registered Obserra company owner.",
  robots: {
    index: false,
    follow: false,
    nocache: true,
    noarchive: true,
    nosnippet: true,
  },
};

function firstValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function safeReturnTo(value: string | string[] | undefined) {
  const candidate = firstValue(value);
  if (!candidate || !candidate.startsWith("/command-center") || candidate.startsWith("//")) {
    return "/command-center";
  }
  return candidate.slice(0, 2_000);
}

export default async function OwnerAccessPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const returnTo = safeReturnTo(params.redirect_url ?? params.redirectUrl);
  const session = await auth();

  if (!session.userId) {
    return (
      <main className={styles.shell}>
        <section className={styles.brandPanel}>
          <Image
            src="/brand/obserra-logo.png"
            alt="Obserra Executive Protection and Intelligence LLC"
            width={260}
            height={51}
            priority
          />
          <p className={styles.eyebrow}>PRIVATE COMPANY-OWNER SYSTEM</p>
          <h1>Authenticate to the Obserra Owner Command Center.</h1>
          <p>
            This gateway is separate from the public Academy and customer portal. Access is restricted to the
            single identity permanently bound as the registered company owner. No email address is used as an
            authorization decision.
          </p>
          <div className={styles.assuranceGrid}>
            <span>One immutable owner identity</span>
            <span>Issuer-bound session verification</span>
            <span>No public indexing or caching</span>
            <span>Every course mutation audited</span>
          </div>
        </section>
        <section className={styles.authPanel}>
          <SignIn
            routing="path"
            path="/owner-access"
            forceRedirectUrl={`/owner-access?redirect_url=${encodeURIComponent(returnTo)}`}
            fallbackRedirectUrl={`/owner-access?redirect_url=${encodeURIComponent(returnTo)}`}
          />
        </section>
      </main>
    );
  }

  const token = await session.getToken();
  if (!token) {
    return (
      <main className={styles.shell}>
        <section className={styles.statusPanel}>
          <p className={styles.eyebrow}>OWNER SESSION UNAVAILABLE</p>
          <h1>The authenticated session did not provide a verifiable identity token.</h1>
          <p>Sign out, authenticate again, and return to the private owner gateway.</p>
        </section>
      </main>
    );
  }

  const verification = await verifyAcademyOwner(token);
  if (verification.state === "authorized") {
    redirect(returnTo);
  }
  if (verification.state === "denied") {
    notFound();
  }

  return (
    <main className={styles.shell}>
      <section className={styles.brandPanel}>
        <Image
          src="/brand/obserra-logo.png"
          alt="Obserra Executive Protection and Intelligence LLC"
          width={260}
          height={51}
          priority
        />
        <p className={styles.eyebrow}>OWNER IDENTITY INITIALIZATION</p>
        <h1>Bind this authenticated identity to the company-owner control plane.</h1>
        <p>
          The one-time owner proof is validated by the protected Academy control service. The proof is not stored
          in this website, browser storage, GitHub, or Vercel. Once claimed, future access is determined only by
          the immutable identity subject and trusted issuer recorded in the protected database.
        </p>
        <div className={styles.assuranceGrid}>
          <span>Single-use proof</span>
          <span>Identity and issuer binding</span>
          <span>No email authorization</span>
          <span>Fail-closed denial</span>
        </div>
      </section>
      <section className={styles.authPanel}>
        {verification.state === "bootstrap-required" ? (
          <OwnerBootstrapClient redirectUrl={returnTo} />
        ) : (
          <div className={styles.statusPanel}>
            <p className={styles.eyebrow}>VERIFICATION SERVICE UNAVAILABLE</p>
            <h2>The owner control service did not return a verified authorization state.</h2>
            <p>No access was granted. Reload this private gateway after the service is healthy.</p>
          </div>
        )}
      </section>
    </main>
  );
}
