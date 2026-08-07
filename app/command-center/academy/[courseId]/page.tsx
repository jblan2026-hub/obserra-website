import { redirectToOwnerSite } from "../../../../lib/owner-site-redirect";

export const dynamic = "force-dynamic";

export default function OwnerCourseReviewRedirectPage() {
  redirectToOwnerSite("/course");
}
