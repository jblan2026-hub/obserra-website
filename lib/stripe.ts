import "server-only";
import Stripe from "stripe";

export function getStripe() {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error("Stripe is not configured");
  return new Stripe(key, { apiVersion: "2026-07-29.dahlia", typescript: true });
}

/**
 * Products are linked to Academy course identifiers in Stripe metadata so no
 * payment-link URL or secret is embedded in the public application bundle.
 */
export async function paymentLinkForCourse(courseId: string) {
  return (await paymentLinksByCourse()).get(courseId);
}

export async function paymentLinksByCourse() {
  const stripe = getStripe();
  const links = new Map<string, Stripe.PaymentLink>();
  let startingAfter: string | undefined;
  do {
    const page = await stripe.paymentLinks.list({ active: true, limit: 100, starting_after: startingAfter });
    for (const link of page.data) {
      const courseId = link.metadata?.obserraCourseId;
      if (courseId) links.set(courseId, link);
    }
    startingAfter = page.data.at(-1)?.id;
    if (!page.has_more) break;
  } while (startingAfter);
  return links;
}

/** Creates only missing catalog records from the authenticated owner console. */
export async function provisionCoursePaymentLink(input: {
  id: string;
  title: string;
  description: string;
  department: string;
  level: string;
  price: number;
}, existing?: Stripe.PaymentLink) {
  existing ??= await paymentLinkForCourse(input.id);
  if (existing) return { link: existing, created: false };

  const stripe = getStripe();
  const product = await stripe.products.create({
    name: input.title,
    description: input.description,
    metadata: { obserraCourseId: input.id, department: input.department, level: input.level },
  });
  const price = await stripe.prices.create({
    currency: "usd",
    unit_amount: Math.round(input.price * 100),
    product: product.id,
    metadata: { obserraCourseId: input.id },
  });
  const link = await stripe.paymentLinks.create({
    line_items: [{ price: price.id, quantity: 1 }],
    metadata: { obserraCourseId: input.id },
  });
  return { link, created: true };
}
