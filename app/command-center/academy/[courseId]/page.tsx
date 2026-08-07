import { notFound } from "next/navigation";
import { courseForId } from "../../../../lib/academy";
import {
  academyOwnerCourse,
  createAcademyCourseDocument,
  normalizeAcademyCourseDocument,
} from "../../../../lib/academy-control";
import { defaultAcademyCourseControl, type AcademyCourseControl } from "../../../../lib/academy-control-contracts";
import { requireOwnerAccess } from "../../../../lib/owner-access";
import { finalAssessment, lessonBrief } from "../../../academy/courseExperience";
import OwnerCourseManager from "./OwnerCourseManager";

export const dynamic = "force-dynamic";

export default async function OwnerCourseReviewPage({
  params,
}: {
  params: Promise<{ courseId: string }>;
}) {
  const { courseId } = await params;
  const access = await requireOwnerAccess(`/command-center/academy/${courseId}`);
  const sourceCourse = courseForId(courseId);
  if (!sourceCourse) notFound();

  const sourceLessons = sourceCourse.modules
    .map((_, index) => lessonBrief(sourceCourse.id, index))
    .filter((lesson): lesson is NonNullable<typeof lesson> => Boolean(lesson));
  const sourceAssessment = finalAssessment(sourceCourse.id);
  if (sourceLessons.length !== sourceCourse.modules.length || sourceAssessment.length < 1) notFound();

  const snapshot = await academyOwnerCourse(access.token, sourceCourse.id);
  const defaultDocument = createAcademyCourseDocument(sourceCourse, sourceLessons, sourceAssessment);
  const document = normalizeAcademyCourseDocument(
    snapshot.contentOverride?.document,
    sourceCourse,
    sourceLessons,
    sourceAssessment,
  );

  const rawControl = snapshot.control;
  const control: AcademyCourseControl = rawControl
    ? {
        courseId: sourceCourse.id,
        lifecycle: rawControl.lifecycle,
        publicVisible: rawControl.public_visible,
        purchaseEnabled: rawControl.purchase_enabled,
        preserveExistingEntitlements: true,
        revision: rawControl.revision,
        updatedAt: rawControl.updated_at,
        reason: rawControl.reason,
      }
    : defaultAcademyCourseControl(sourceCourse.id);

  return (
    <OwnerCourseManager
      initialDocument={document ?? defaultDocument}
      initialControl={control}
      initialContentRevision={snapshot.contentOverride?.revision ?? 0}
      events={snapshot.events}
    />
  );
}
