import type { Metadata } from "next";
import "./ai-native-learning.css";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default function LearningLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return children;
}
