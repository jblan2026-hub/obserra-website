import Link from "next/link";
import type { ReactNode } from "react";

type GovernedFloridaClassDLinkProps = {
  children: ReactNode;
  className?: string;
  enabled: boolean;
  href: string;
};

export default function GovernedFloridaClassDLink({
  children,
  className,
  enabled,
  href,
}: GovernedFloridaClassDLinkProps) {
  if (!enabled) return null;
  return <Link className={className} href={href}>{children}</Link>;
}
