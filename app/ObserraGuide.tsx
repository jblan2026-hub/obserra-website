"use client";

import dynamic from "next/dynamic";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useState } from "react";
import styles from "./ObserraGuide.module.css";

const ObserraGuidePanel = dynamic(() => import("./ObserraGuidePanel"), {
  ssr: false,
  loading: () => null,
});

const excludedPaths = [
  "/admin",
  "/api",
  "/sign-in",
  "/sign-up",
  "/academy/learn",
  "/academy/certificate",
  "/academy/success",
  "/florida-security-training",
];

export default function ObserraGuide() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const excluded = excludedPaths.some((path) => pathname.startsWith(path));

  if (excluded) return null;

  return (
    <aside className={styles.guide} aria-label="Obserrian Executive Intelligence Advisor">
      {open ? <ObserraGuidePanel onClose={() => setOpen(false)} /> : null}
      <button
        type="button"
        className={styles.launcher}
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-label={open ? "Minimize Obserrian" : "Open Obserrian Executive Intelligence Advisor"}
      >
        <Image src="/brand/obserra-mark.svg" alt="" aria-hidden="true" width={46} height={46} className={styles.launcherMark} />
        {!open ? <span>Ask Obserrian</span> : null}
      </button>
    </aside>
  );
}
