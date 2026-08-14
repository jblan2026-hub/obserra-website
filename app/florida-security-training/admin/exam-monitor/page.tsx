import { requireFloridaClassDStaff } from "../../../../lib/florida-class-d-auth";
import ExamMonitoringConsole from "./ExamMonitoringConsole";

export const dynamic = "force-dynamic";

export default async function FloridaClassDExamMonitorPage() {
  await requireFloridaClassDStaff(["instructor", "school_admin", "compliance_admin"]);
  return <ExamMonitoringConsole />;
}
