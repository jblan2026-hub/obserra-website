import { marketplaceApps } from "./appsData";

const legacyAliases: Record<string, string> = {
  "obserra-incident-command": "obserra-crisis-commander",
  "obserra-incident-command-console": "obserra-crisis-commander",
  "obserra-cyber-crisis-commander": "obserra-crisis-commander",
};

/**
 * Generated catalog records are deliberately not merged here. A release source
 * can only add availability after it supplies a separately reviewed evidence
 * contract and an exact approved action target.
 */
export const storefrontApps = marketplaceApps;
export function findStorefrontAppBySlug(slug: string) {
  const canonicalSlug = legacyAliases[slug] ?? slug;
  return storefrontApps.find((entry) => entry.slug === canonicalSlug);
}
