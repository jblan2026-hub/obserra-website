import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { getInternalOwnerAuthority } from "../../../../../../lib/auth/authority-repository";
import { prepareSupabaseAuthRuntime } from "../../../../../../lib/auth/runtime-config";
import { requireFloridaClassDOwnerTestPrincipal } from "../../../../../../lib/florida-class-d-owner-test-session";
import OwnerLearnerWorkspace from "./OwnerLearnerWorkspace";
import "../../../../owner-preview/owner-preview.css";
import "../../owner-lms.css";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Owner Learner Rehearsal | OBSERRA EXECUTIVE PROTECTION & INTELLIGENCE LLC",
  robots: { index: false, follow: false, noarchive: true, nosnippet: true },
};

const SURFACES = new Set(["learner_1", "learner_2", "learner_3"]);

export default async function OwnerLearnerPage({
  params,
  searchParams,
}: {
  params: Promise<{ surface: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const [{ surface }, query] = await Promise.all([params, searchParams]);
  if (!SURFACES.has(surface)) notFound();
  const sessionId = Array.isArray(query.session) ? query.session[0] : query.session;
  if (!sessionId || !/^[0-9a-f-]{36}$/i.test(sessionId)) notFound();

  const returnPath = `/florida-security-training/owner-validation/lms/learner/${surface}?session=${encodeURIComponent(sessionId)}`;
  const authority = await getInternalOwnerAuthority();
  if (!authority.identity || authority.status === "signed_out") redirect(`/sign-in?redirect_url=${encodeURIComponent(returnPath)}`);
  if (authority.identity.assuranceLevel !== "aal2") redirect(`/auth/mfa?redirect_url=${encodeURIComponent(returnPath)}`);
  await requireFloridaClassDOwnerTestPrincipal();

  const runtime = prepareSupabaseAuthRuntime();
  if (!runtime.ready || !runtime.url || !runtime.projectRef || !runtime.publishableKey) throw new Error("Owner learner runtime is unavailable.");

  return (
    <main className="owner-preview owner-lms-learner-page">
      <OwnerLearnerWorkspace
        sessionId={sessionId}
        surface={surface as "learner_1" | "learner_2" | "learner_3"}
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
