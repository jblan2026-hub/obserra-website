import { redirect } from "next/navigation";
import { ACADEMY_BRAND_NAME } from "../../../lib/legal-identity";

type SuccessParams = { course?: string; session_id?: string };

export const dynamic = "force-dynamic";

export default async function AcademySuccessPage({ searchParams }: { searchParams: Promise<SuccessParams> }) {
  const params = await searchParams;
  if (!params.course || !params.session_id) redirect("/academy?enrollment=invalid");
  return (
    <main className="academy-payment-recovery">
      <section>
        <p className="kicker">SECURE PAYMENT RETURN</p>
        <h1>Confirm your Academy access</h1>
        <p>
          Stripe has returned you to {ACADEMY_BRAND_NAME}. Access is granted only after the signed payment webhook is
          recorded and your signed-in learner identity matches the purchaser.
        </p>
        <form action="/api/academy/redeem" method="post">
          <input type="hidden" name="course" value={params.course} />
          <input type="hidden" name="session_id" value={params.session_id} />
          <button type="submit">Confirm paid access</button>
        </form>
        <p className="fine-print">If payment is still processing, wait a moment and try again. This action never creates another charge.</p>
      </section>
    </main>
  );
}
