import { NextResponse } from "next/server";
import { courses } from "../../../academy/courseData";
import { requireOwnerApi } from "../../../../lib/owner-auth";
import { paymentLinksByCourse, provisionCoursePaymentLink } from "../../../../lib/stripe";

export const runtime = "nodejs";
export const maxDuration = 60;

const responseHeaders = {
  "cache-control": "private, no-store, max-age=0",
  "referrer-policy": "no-referrer",
  "x-content-type-options": "nosniff",
  "x-robots-tag": "noindex, nofollow, noarchive",
};

export async function POST() {
  const owner = await requireOwnerApi();
  if (!owner) return NextResponse.json({ error: "Not found" }, { status: 404, headers: responseHeaders });

  if (!process.env.STRIPE_SECRET_KEY || !process.env.STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json(
      { error: "Stripe production configuration is incomplete." },
      { status: 503, headers: responseHeaders },
    );
  }

  try {
    const existingByCourse = await paymentLinksByCourse();
    const results: boolean[] = [];
    for (let index = 0; index < courses.length; index += 4) {
      const batch = courses.slice(index, index + 4);
      const batchResults = await Promise.all(batch.map(async (course) => {
        const result = await provisionCoursePaymentLink(course, existingByCourse.get(course.id));
        return result.created;
      }));
      results.push(...batchResults);
    }
    const created = results.filter(Boolean).length;
    return NextResponse.json(
      { created, alreadyConfigured: results.length - created, total: results.length },
      { headers: responseHeaders },
    );
  } catch {
    return NextResponse.json(
      { error: "Commerce provisioning did not complete. No payment details were exposed." },
      { status: 502, headers: responseHeaders },
    );
  }
}
