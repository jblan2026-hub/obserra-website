"use client";

import Link from "next/link";
import { createPortal } from "react-dom";
import { useEffect, useId, useRef, useState, type ReactNode } from "react";
import styles from "./ExecutiveDetailModal.module.css";

type ExecutiveDetailModalProps = {
  eyebrow?: string;
  title: string;
  summary: string;
  triggerLabel?: string;
  children: ReactNode;
  actionHref?: string;
  actionLabel?: string;
};

export default function ExecutiveDetailModal({
  eyebrow,
  title,
  summary,
  triggerLabel = "View details",
  children,
  actionHref,
  actionLabel = "More information",
}: ExecutiveDetailModalProps) {
  const [open, setOpen] = useState(false);
  const titleId = useId();
  const triggerRef = useRef<HTMLButtonElement>(null);
  const dialogRef = useRef<HTMLElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        return;
      }
      if (event.key !== "Tab" || !dialogRef.current) return;

      const focusable = Array.from(
        dialogRef.current.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])',
        ),
      );
      if (!focusable.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
      triggerRef.current?.focus();
    };
  }, [open]);

  const modal = open && typeof document !== "undefined"
    ? createPortal(
        <div className={styles.backdrop} onMouseDown={() => setOpen(false)}>
          <section
            ref={dialogRef}
            className={styles.dialog}
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            onMouseDown={(event) => event.stopPropagation()}
          >
            <header className={styles.header}>
              <div>
                {eyebrow ? <p>{eyebrow}</p> : null}
                <h2 id={titleId}>{title}</h2>
                <span>{summary}</span>
              </div>
              <button ref={closeRef} type="button" onClick={() => setOpen(false)} aria-label="Close details">×</button>
            </header>
            <div className={styles.content}>{children}</div>
            <footer className={styles.footer}>
              {actionHref ? <Link href={actionHref}>{actionLabel}</Link> : null}
              <button type="button" onClick={() => setOpen(false)}>Close</button>
            </footer>
          </section>
        </div>,
        document.body,
      )
    : null;

  return (
    <>
      <button ref={triggerRef} type="button" className={styles.trigger} onClick={() => setOpen(true)}>
        {eyebrow ? <span className={styles.eyebrow}>{eyebrow}</span> : null}
        <strong>{title}</strong>
        <span className={styles.summary}>{summary}</span>
        <span className={styles.action}>{triggerLabel} <b aria-hidden="true">→</b></span>
      </button>
      {modal}
    </>
  );
}
