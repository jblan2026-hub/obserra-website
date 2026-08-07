import type { Metadata } from "next";
import type { ReactNode } from "react";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: {
    default: "Owner Command Center | Obserra",
    template: "%s | Owner Command Center",
  },
  description: "Private owner operations workspace for Obserra.",
  robots: {
    index: false,
    follow: false,
    nocache: true,
  },
};

export default function OwnerCommandCenterLayout({ children }: { children: ReactNode }) {
  return children;
}
