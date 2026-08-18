import Link from "next/link";
import type { ReactNode } from "react";

type GovernedFloridaClassDLinkProps = {
  children: ReactNode;
  className?: string;
  enabled: boolean;
  href: string;
  lockedLabel?: string;
};

export default function GovernedFloridaClassDLink({
  children,
  className,
  enabled,
  href,
  lockedLabel = "Enrollment and payment unavailable pending license activation",
}: GovernedFloridaClassDLinkProps) {
  if (!enabled) {
    return (
      <button
        aria-disabled="true"
        className={className}
        disabled
        title={lockedLabel}
        type="button"
      >
        {children}
      </button>
    );
  }

  return <Link className={className} href={href}>{children}</Link>;
}
