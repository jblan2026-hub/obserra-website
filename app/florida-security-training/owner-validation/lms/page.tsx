import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getInternalOwnerAuthority } from "../../../../lib/auth/authority-repository";
import { prepareSupabaseAuthRuntime } from "../../../../lib/auth/runtime-config";
import { requireFloridaClassDOwnerTestPrincipal } from "../../../../lib/florida-class-d-owner-test-session";
import OwnerValidationLmsConsole from "./OwnerValidationLmsConsole";
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
  const runtime = prepareSupabaseAuthRuntime();
  if (!runtime.ready || !runtime.url || !runtime.projectRef || !runtime.publishableKey) {
    throw new Error("Owner LMS persistence runtime is unavailable.");
  }

  return (
    <main className="owner-preview">
      <OwnerValidationLmsConsole
        releaseCommitSha={actor.releaseCommitSha}
        runtime={{
          ready: runtime.ready,
          url: runtime.url,
          projectRef: runtime.projectRef,
          publishableKey: runtime.publishableKey,
          production: process.env.VERCEL_ENV === "production",
        }}
      />
    </main>
  );
}
