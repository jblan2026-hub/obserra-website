import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getInternalOwnerAuthority } from "../../../../lib/auth/authority-repository";
import { requireFloridaClassDOwnerTestPrincipal } from "../../../../lib/florida-class-d-owner-test-session";
import OwnerPreviewConsole from "./OwnerValidationLmsConsole";
import "../../owner-preview/owner-preview.css";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Live Owner LMS Test | OBSERRA EXECUTIVE PROTECTION & INTELLIGENCE LLC",
  robots: { index: false, follow: false, noarchive: true, nosnippet: true },
};

const OWNER_LMS_PATH = "/florida-security-training/owner-validation/lms";

export default async function FloridaClassDOwnerValidationLmsPage() {
  const authority = await getInternalOwnerAuthority();
  if (!authority.identity || authority.status === "signed_out") {
    redirect(`/sign-in?redirect_url=${encodeURIComponent(OWNER_LMS_PATH)}`);
  }
  if (authority.identity.assuranceLevel !== "aal2") {
    redirect(`/auth/mfa?redirect_url=${encodeURIComponent(OWNER_LMS_PATH)}`);
  }

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
