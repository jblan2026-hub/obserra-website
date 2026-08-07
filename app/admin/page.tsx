import type { Metadata } from "next";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Owner Administration",
  robots: { index: false, follow: false, noarchive: true, nosnippet: true },
};

export default function LegacyAdminPage() {
  redirect("/command-center");
}
