"use client";

import Link from "next/link";
import { useEffect, useId, useRef, useState } from "react";
import styles from "./ExecutiveInfoModal.module.css";

type ExecutiveInfoModalProps = {
  number: string;
  title: string;
  summary: string;
  description: string;
  details: string[];
  href: string;
  linkLabel: string;
};

export default function ExecutiveInfoModal({
  number,
  title,
  summary,
  description,
  details,
  href,
  linkLabel,
}: ExecutiveInfoModalProps) {
  const [open, setOpen] = useState(false);
  const titleId = useId();
  const triggerRef = useRef<HTMLButtonElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
      triggerRef.current?.focus();
    };
  }, [open]);

  return (
    <>
      <button ref={triggerRef} type="button" className={styles.trigger} onClick={() => setOpen(true)}>
        <span className={styles.number}>{number}</span>
        <strong className={styles.title}>{title}</strong>
        <span className={styles.summary}>{summary}</span>
        <span className={styles.action}>More info +</span>
      </button>

      {open ? (
        <div className={styles.backdrop} onMouseDown={() => setOpen(false)}>
          <section
            className={styles.dialog}
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            onMouseDown={(event) => event.stopPropagation()}
          >
            <button ref={closeRef} type="button" className={styles.close} onClick={() => setOpen(false)} aria-label="Close details">
              ×
            </button>
            <p className={styles.eyebrow}>OBSERRA CAPABILITY {number}</p>
            <h2 id={titleId}>{title}</h2>
            <p>{description}</p>
            <div className={styles.details}>
              {details.map((detail) => <span key={detail}>{detail}</span>)}
            </div>
            <div className={styles.footer}>
              <Link href={href} className={styles.primary}>{linkLabel}</Link>
              <button type="button" className={styles.secondary} onClick={() => setOpen(false)}>Close</button>
            </div>
          </section>
        </div>
      ) : null}
    </>
  );
}
