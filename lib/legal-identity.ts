export const LEGAL_ENTITY_NAME = "OBSERRA EXECUTIVE PROTECTION & INTELLIGENCE LLC" as const;
export const CANONICAL_PUBLIC_ORIGIN = "https://www.obserrallc.com" as const;

export function legalEntityProduct(productName: string) {
  return `${productName}, a product of ${LEGAL_ENTITY_NAME}`;
}
