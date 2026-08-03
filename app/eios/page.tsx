import type { Metadata } from "next";
import EiosShowcase from "./EiosShowcase";

export const metadata: Metadata = {
  title: "EIOS | Governed Enterprise Intelligence | Obserra",
  description: "Explore EIOS, Obserra's enterprise intelligence experience for evidence grounded decisions, governed action, and verifiable outcomes.",
  alternates: { canonical: "/eios" },
};

export default function EiosPage() {
  return <EiosShowcase />;
}
