import { auth, currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { courses } from "../../../academy/courseData";
import { ownerEmailAllowed } from "../../../../lib/academy";
import { paymentLinksByCourse, provisionCoursePaymentLink } from "../../../../lib/stripe";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST() {
  let approved = false;
  try {
    const { userId } = await auth();
    const user = userId ? await currentUser() : null;
    approved = ownerEmailAllowed(user?.emailAddresses.map((entry) => entry.emailAddress) ?? []);
  } catch {
    approved = false;
  }
  if (!approved) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (!process.env.STRIPE_SECRET_KEY || !process.env.STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json({ error: "Stripe production configuration is incomplete." }, { status: 503 });
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
    return NextResponse.json({ created, alreadyConfigured: results.length - created, total: results.length });
  } catch {
    return NextResponse.json({ error: "Commerce provisioning did not complete. No payment details were exposed." }, { status: 502 });
  }
}
