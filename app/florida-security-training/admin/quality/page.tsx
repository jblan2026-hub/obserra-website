import type { Metadata } from "next";
import { requireFloridaClassDStaff } from "../../../../lib/florida-class-d-auth";
import {
  listFloridaClassDQualityCases,
  listFloridaClassDRetentionReviews,
} from "../../../../lib/florida-class-d-quality";
import QualityConsole from "./QualityConsole";
import "../../live-classroom.css";

export const metadata: Metadata = {
  title: "Florida Class D Quality Management | Obserra",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function FloridaClassDQualityPage() {
  await requireFloridaClassDStaff(["school_admin", "compliance_admin"]);
  const [cases, retentionReviews] = await Promise.all([
    listFloridaClassDQualityCases(),
    listFloridaClassDRetentionReviews(),
  ]);
  return <QualityConsole initialCases={cases} initialRetentionReviews={retentionReviews} />;
}
