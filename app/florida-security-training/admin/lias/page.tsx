import type { Metadata } from "next";
import { requireFloridaClassDStaff } from "../../../../lib/florida-class-d-auth";
import { listFloridaClassDLiasWorkflowQueue } from "../../../../lib/florida-class-d-lias";
import LiasWorkflowConsole from "./LiasWorkflowConsole";
import "../../live-classroom.css";

export const metadata: Metadata = {
  title: "Florida Class D LIAS Workflow | OBSERRA EXECUTIVE PROTECTION & INTELLIGENCE LLC",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function FloridaClassDLiasWorkflowPage() {
  await requireFloridaClassDStaff(["school_admin", "compliance_admin"]);
  const queue = await listFloridaClassDLiasWorkflowQueue();
  return <LiasWorkflowConsole initialQueue={queue} />;
}
