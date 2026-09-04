"use client";

import Image from "next/image";
import Link from "next/link";
import { createPortal } from "react-dom";
import { useEffect, useId, useRef, useState } from "react";
import styles from "./ExecutiveInfoModal.module.css";

type ExecutiveInfoModalProps = {
  title: string;
  summary: string;
  description: string;
  details: string[];
  href: string;
  linkLabel: string;
  category?: string;
  image?: string;
  imageAlt?: string;
};

const FOCUSABLE_SELECTOR = [
  "a[href]",
  "button:not([disabled])",
  "textarea:not([disabled])",
  "input:not([disabled])",
  "select:not([disabled])",
  "[tabindex]:not([tabindex='-1'])",
].join(",");

export default function ExecutiveInfoModal({
  title,
  summary,
  description,
  details,
  href,
  linkLabel,
  category = "Obserra EPI",
  image,
  imageAlt,
}: ExecutiveInfoModalProps) {
  const [open, setOpen] = useState(false);
  const titleId = useId();
  const descriptionId = useId();
  const triggerRef = useRef<HTMLButtonElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const dialogRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!open) return;

    const trigger = triggerRef.current;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        setOpen(false);
        return;
      }
      if (event.key !== "Tab") return;
      const dialog = dialogRef.current;
      if (!dialog) return;
      const focusable = Array.from(dialog.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR))
        .filter((element) => !element.hasAttribute("disabled") && element.getAttribute("aria-hidden") !== "true");
      if (focusable.length === 0) {
        event.preventDefault();
        dialog.focus();
        return;
      }
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      const active = document.activeElement;
      if (event.shiftKey && active === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && active === last) {
        event.preventDefault();
        first.focus();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
      trigger?.focus();
    };
  }, [open]);

  const modal = open && typeof document !== "undefined"
    ? createPortal(
        <div className={styles.backdrop} role="presentation" onMouseDown={() => setOpen(false)}>
          <section
            ref={dialogRef}
            className={styles.dialog}
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            aria-describedby={descriptionId}
            tabIndex={-1}
            onMouseDown={(event) => event.stopPropagation()}
          >
            <button ref={closeRef} type="button" className={styles.close} onClick={() => setOpen(false)} aria-label="Close details">×</button>
            <p className={styles.eyebrow}>{category}</p>
            <h2 id={titleId}>{title}</h2>
            <p id={descriptionId}>{description}</p>
            <div className={styles.details}>{details.map((detail) => <span key={detail}>{detail}</span>)}</div>
            <div className={styles.footer}>
              <Link href={href} className={styles.primary} onClick={() => setOpen(false)}>{linkLabel}</Link>
              <button type="button" className={styles.secondary} onClick={() => setOpen(false)}>Close</button>
            </div>
          </section>
        </div>,
        document.body,
      )
    : null;

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        data-card-variant={image ? "visual" : "text"}
        className={`${styles.trigger} ${image ? styles.visualTrigger : styles.textTrigger}`}
        onClick={() => setOpen(true)}
        aria-haspopup="dialog"
        aria-expanded={open}
      >
        {image ? (
          <span className={styles.media} aria-hidden="true">
            <Image src={image} alt={imageAlt ?? ""} fill sizes="(max-width: 760px) 92vw, 360px" />
            <span className={styles.mediaShade} />
            <span className={styles.category}>{category}</span>
          </span>
        ) : null}
        <span className={styles.cardBody}>
          <strong className={styles.title}>{title}</strong>
          <span className={styles.summary}>{summary}</span>
          <span className={styles.action}>View details</span>
        </span>
      </button>
      {modal}
    </>
  );
}
