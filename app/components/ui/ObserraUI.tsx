import type { ComponentPropsWithoutRef, ReactNode } from "react";
import Link from "next/link";

function join(...values: Array<string | false | null | undefined>) {
  return values.filter(Boolean).join(" ");
}

type ButtonVariant = "primary" | "secondary" | "ghost";

type ButtonLinkProps = {
  href: string;
  children: ReactNode;
  variant?: ButtonVariant;
  className?: string;
  ariaLabel?: string;
};

export function ButtonLink({ href, children, variant = "primary", className, ariaLabel }: ButtonLinkProps) {
  const classes = join("obs-button", `obs-button--${variant}`, className);
  if (href.startsWith("http") || href.startsWith("mailto:")) {
    return <a href={href} className={classes} aria-label={ariaLabel}>{children}</a>;
  }
  return <Link href={href} className={classes} aria-label={ariaLabel}>{children}</Link>;
}

type ButtonProps = ComponentPropsWithoutRef<"button"> & { variant?: ButtonVariant };

export function Button({ variant = "primary", className, type = "button", ...props }: ButtonProps) {
  return <button type={type} className={join("obs-button", `obs-button--${variant}`, className)} {...props} />;
}

type CardProps = ComponentPropsWithoutRef<"article"> & { interactive?: boolean };

export function Card({ interactive = false, className, ...props }: CardProps) {
  return <article className={join("obs-card", interactive && "obs-card--interactive", className)} {...props} />;
}

type StatusTone = "neutral" | "success" | "warning" | "danger";

export function StatusBadge({ children, tone = "neutral" }: { children: ReactNode; tone?: StatusTone }) {
  return <span className="obs-status" data-tone={tone}>{children}</span>;
}

type KpiCardProps = {
  label: string;
  value: string;
  trend?: string;
  trendTone?: "positive" | "warning" | "negative";
  status?: string;
  statusTone?: StatusTone;
  children?: ReactNode;
  className?: string;
};

export function KpiCard({ label, value, trend, trendTone = "positive", status, statusTone = "neutral", children, className }: KpiCardProps) {
  return (
    <Card className={join("obs-kpi", className)} interactive>
      <div className="obs-kpi__header">
        <span className="obs-kpi__label">{label}</span>
        {status ? <StatusBadge tone={statusTone}>{status}</StatusBadge> : null}
      </div>
      <strong className="obs-kpi__value">{value}</strong>
      {trend ? <span className="obs-kpi__trend" data-tone={trendTone}>{trend}</span> : null}
      {children}
    </Card>
  );
}

export function Panel({ title, eyebrow, action, children, className }: { title: string; eyebrow?: string; action?: ReactNode; children: ReactNode; className?: string }) {
  return (
    <section className={join("obs-panel", className)}>
      <header className="obs-panel__header">
        <div className="obs-stack" style={{ gap: "var(--obs-space-2)" }}>
          {eyebrow ? <p className="obs-eyebrow">{eyebrow}</p> : null}
          <h2 className="obs-heading">{title}</h2>
        </div>
        {action}
      </header>
      <div className="obs-panel__body">{children}</div>
    </section>
  );
}

export function Field({ label, hint, children }: { label: string; hint?: string; children: ReactNode }) {
  return (
    <label className="obs-label">
      <span>{label}</span>
      {children}
      {hint ? <small className="obs-copy">{hint}</small> : null}
    </label>
  );
}

export function PageIntro({ eyebrow, title, copy, actions }: { eyebrow?: string; title: string; copy?: string; actions?: ReactNode }) {
  return (
    <header className="obs-stack">
      {eyebrow ? <p className="obs-eyebrow">{eyebrow}</p> : null}
      <h1 className="obs-heading" style={{ fontSize: "var(--obs-text-3xl)" }}>{title}</h1>
      {copy ? <p className="obs-copy" style={{ maxWidth: "780px" }}>{copy}</p> : null}
      {actions ? <div className="obs-cluster">{actions}</div> : null}
    </header>
  );
}
