import type { Metadata } from "next";
import { ShieldCheck } from "lucide-react";
import { requireFloridaClassDOwnerPreviewPrincipal } from "../../../lib/florida-class-d-owner-preview-auth";
import { getFloridaClassDOwnerPreviewReport } from "../../../lib/florida-class-d-owner-preview";
import { readFloridaClassDOwnerPreviewState } from "../../../lib/florida-class-d-owner-preview-state";
import OwnerPreviewConsole from "./OwnerPreviewConsole";
import "./owner-preview.css";

// This route is temporarily redirected in proxy.ts while production owner-review configuration is remediated.
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Internal Owner LMS Review | OBSERRA EXECUTIVE PROTECTION & INTELLIGENCE LLC",
  robots: { index: false, follow: false, noarchive: true, nosnippet: true },
};

export default async function FloridaClassDOwnerPreviewPage() {
  const actor = await requireFloridaClassDOwnerPreviewPrincipal();
  const report = getFloridaClassDOwnerPreviewReport();
  const state = await readFloridaClassDOwnerPreviewState();

  return (
    <main className="owner-preview">
      <div className="owner-preview__watermark" role="status">
        <ShieldCheck size={16} aria-hidden="true" />
        {report.watermark}
      </div>
      <OwnerPreviewConsole
        state={state}
        releaseCommitSha={actor.releaseCommitSha}
        authorizationExpiresAt={report.expiresAt ?? actor.expiresAt}
        watermark={report.watermark}
      />
    </main>
  );
}
