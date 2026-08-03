import { redirect } from "next/navigation";

type SuccessParams = { course?: string; session_id?: string };

export const dynamic = "force-dynamic";

export default async function AcademySuccessPage({ searchParams }: { searchParams: Promise<SuccessParams> }) {
  const params = await searchParams;
  if (!params.course || !params.session_id) redirect("/academy?enrollment=invalid");
  redirect(`/api/academy/redeem?course=${encodeURIComponent(params.course)}&session_id=${encodeURIComponent(params.session_id)}`);
}
