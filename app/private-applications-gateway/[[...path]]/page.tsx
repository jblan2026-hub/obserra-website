import { auth } from "@clerk/nextjs/server";
import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { applicationsTeamUserAuthorized } from "../../../lib/applications-team-access";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export const metadata: Metadata = {
  title: "Private Applications Workspace",
  description: "Private applications workspace.",
  robots: {
    index: false,
    follow: false,
    nocache: true,
    googleBot: {
      index: false,
      follow: false,
      noimageindex: true,
    },
  },
};

export default async function PrivateApplicationsGateway() {
  const { userId } = await auth();
  if (!applicationsTeamUserAuthorized(userId)) notFound();
  redirect("/portal/applications");
}
