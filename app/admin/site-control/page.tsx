import { auth, currentUser } from "@clerk/nextjs/server";
import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { ownerEmailAllowed } from "../../../lib/academy";
import OwnerAiSiteControl from "./OwnerAiSiteControl";
import "../admin.css";
import "../admin-refine.css";

export const metadata: Metadata = {
  title: "AI Website Control Center | Obserra Owner Administration",
  robots: { index: false, follow: false },
};

export default async function OwnerSiteControlPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in?redirect_url=/admin/site-control");

  const user = await currentUser();
  const emails = user?.emailAddresses.map((item) => item.emailAddress) ?? [];
  if (!ownerEmailAllowed(emails)) notFound();

  return (
    <main className="admin-shell">
      <header>
        <a href="/admin">Owner administration</a>
        <span>SECURED OWNER AI CHANGE CONTROL</span>
      </header>
      <section className="admin-hero">
        <p>Signed in owner: {emails[0]}</p>
        <h1>Governed AI website updates</h1>
        <p>
          Generate structured website changes, inspect every proposed operation, create a dedicated GitHub branch and Vercel preview, and keep production unchanged until final owner approval.
        </p>
      </section>
      <OwnerAiSiteControl />
    </main>
  );
}
