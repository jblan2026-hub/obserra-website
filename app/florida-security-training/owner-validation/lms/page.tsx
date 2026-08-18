import type { Metadata } from "next";
import { requireFloridaClassDOwnerTestPrincipal } from "../../../../lib/florida-class-d-owner-test-session";
import OwnerPreviewConsole from "./OwnerValidationLmsConsole";
import "../../owner-preview/owner-preview.css";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Live Owner LMS Test | OBSERRA EXECUTIVE PROTECTION & INTELLIGENCE LLC",
  robots: { index: false, follow: false, noarchive: true, nosnippet: true },
};

export default async function FloridaClassDOwnerValidationLmsPage() {
  const actor = await requireFloridaClassDOwnerTestPrincipal();

  return (
    <main
      className="owner-preview"
      data-daily-api="/api/florida-class-d/owner-validation/daily"
      data-courseware-api="/api/florida-class-d/owner-validation/courseware"
    >
      <OwnerPreviewConsole
        initialView="live"
        releaseCommitSha={actor.releaseCommitSha}
      />
    </main>
  );
}
