import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./florida-lms-saas.css";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default function FloridaSecurityTrainingLayout({ children }: { children: ReactNode }) {
  return <div className="fl-classd--product">{children}</div>;
}
