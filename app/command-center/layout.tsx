import type { Metadata } from "next";
import type { ReactNode } from "react";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Owner Command Center | Obserra",
  description: "Private, authenticated operating site for the Obserra company owner.",
  robots: {
    index: false,
    follow: false,
    nocache: true,
    noarchive: true,
    nosnippet: true,
  },
};

export default function OwnerCommandCenterLayout({ children }: { children: ReactNode }) {
  return children;
}
