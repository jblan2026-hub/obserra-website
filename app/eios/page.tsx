import type { Metadata } from "next";
import EiosShowcase from "./EiosShowcase";

export const metadata: Metadata = {
  title: "EIOS | Governed Enterprise Intelligence and Action | Obserra",
  description: "EIOS connects enterprise context, helps leaders make evidence-backed decisions, governs authorized action, and independently verifies outcomes.",
  alternates: { canonical: "/eios" },
};

export default function EiosPage() {
  return <EiosShowcase />;
}
