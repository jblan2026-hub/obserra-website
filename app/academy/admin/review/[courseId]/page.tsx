import { notFound } from "next/navigation";
import CoursePlayer from "../../../learn/CoursePlayer";
import { courseForId } from "../../../../../lib/academy";
import { requireAcademyOwnerReview } from "../../../../../lib/academy-owner-review";
import { finalAssessmentQuestions, lessonBrief } from "../../../courseExperience";

export const dynamic = "force-dynamic";

export default async function OwnerCourseReviewPage({ params }: { params: Promise<{ courseId: string }> }) {
  const { courseId } = await params;
  await requireAcademyOwnerReview(`/academy/admin/review/${courseId}`);

  const course = courseForId(courseId);
  if (!course) notFound();

  const lessons = course.modules
    .map((_, index) => lessonBrief(course.id, index))
    .filter((lesson): lesson is NonNullable<typeof lesson> => Boolean(lesson));

  return (
    <CoursePlayer
      course={course}
      initialProgress={{ completedLessons: course.modules.map((_, index) => index) }}
      lessons={lessons}
      assessment={finalAssessmentQuestions(course.id)}
      watermark="OWNER REVIEW · NOT A CUSTOMER RECORD · OBSERRA PROPRIETARY"
    />
  );
}
