import Link from "next/link";
import type { ReactNode } from "react";

type GovernedFloridaClassDLinkProps = {
  children: ReactNode;
  className?: string;
  enabled: boolean;
  href: string;
  lockedDescriptionId: string;
  lockedLabel?: string;
};

export default function GovernedFloridaClassDLink({
  children,
  className,
  enabled,
  href,
  lockedDescriptionId,
  lockedLabel = "Enrollment and payment unavailable pending license activation",
}: GovernedFloridaClassDLinkProps) {
  if (!enabled) {
    return (
      <>
        <button
          aria-describedby={lockedDescriptionId}
          aria-disabled="true"
          className={className}
          title={lockedLabel}
          type="button"
        >
          {children}
        </button>
        <span className="obs-sr-only" id={lockedDescriptionId}>{lockedLabel}</span>
      </>
    );
  }

  return <Link className={className} href={href}>{children}</Link>;
}
