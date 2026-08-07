import type { Metadata } from "next";
import type { ReactNode } from "react";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Private Owner Site | Obserra",
  description: "Fail-closed redirect boundary for the separately deployed Obserra owner site.",
  robots: {
    index: false,
    follow: false,
    nocache: true,
  },
};

export default function OwnerSiteRedirectLayout({ children }: { children: ReactNode }) {
  return children;
}
