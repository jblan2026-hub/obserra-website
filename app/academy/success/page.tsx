import AcademySuccessClient from "./AcademySuccessClient";

type SuccessParams = { course?: string; session_id?: string };

export const dynamic = "force-dynamic";

export default async function AcademySuccessPage({ searchParams }: { searchParams: Promise<SuccessParams> }) {
  const params = await searchParams;
  const authenticationReady = Boolean(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY && process.env.CLERK_SECRET_KEY);
  return <AcademySuccessClient params={params} authenticationReady={authenticationReady} />;
}
