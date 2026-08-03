import type { Metadata } from "next";
import AcademyClient from "./AcademyClient";

export const metadata: Metadata = {
  title: "Academy | Paid Professional Security, Intelligence & Technology Training",
  description: "Obserra Academy offers paid, interactive training in cybersecurity, protective operations, intelligence, and secure technology governance.",
  alternates: { canonical: "/academy" },
};

export default function AcademyPage() {
  return <AcademyClient />;
}
