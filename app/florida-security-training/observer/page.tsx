import type { Metadata } from "next";
import ObserverClassroom from "./ObserverClassroom";
import "../live-classroom.css";
import "./observer.css";

export const metadata: Metadata = {
  title: "Florida Class D Regulatory Observer | OBSERRA EXECUTIVE PROTECTION & INTELLIGENCE LLC",
  robots: { index: false, follow: false, noarchive: true, nosnippet: true },
};

export default function FloridaClassDObserverPage() {
  return <ObserverClassroom />;
}
