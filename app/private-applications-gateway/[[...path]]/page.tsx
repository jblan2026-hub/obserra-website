import { auth } from "@clerk/nextjs/server";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import AppsPage from "../../apps/page";
import AppDetailPage from "../../apps/[slug]/page";
import SubscribePage from "../../apps/[slug]/subscribe/page";
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

type Props = {
  params: Promise<{ path?: string[] }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function PrivateApplicationsGateway({ params, searchParams }: Props) {
  const { userId } = await auth();
  if (!applicationsTeamUserAuthorized(userId)) notFound();

  const { path = [] } = await params;

  if (path.length === 0) {
    return <AppsPage />;
  }

  if (path.length === 1) {
    return <AppDetailPage params={Promise.resolve({ slug: path[0] })} />;
  }

  if (path.length === 2 && path[1] === "subscribe") {
    return (
      <SubscribePage
        params={Promise.resolve({ slug: path[0] })}
        searchParams={searchParams}
      />
    );
  }

  notFound();
}
