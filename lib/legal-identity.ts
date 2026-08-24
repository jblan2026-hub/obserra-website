export const LEGAL_ENTITY_NAME = "OBSERRA EXECUTIVE PROTECTION & INTELLIGENCE LLC" as const;
export const PUBLIC_BRAND_NAME = "Obserra EPI LLC" as const;
export const CANONICAL_PUBLIC_ORIGIN = "https://www.obserrallc.com" as const;

export const BRAND_PREFIX = "Obserra EPI" as const;
export const ACADEMY_BRAND_NAME = `${BRAND_PREFIX} Academy` as const;
export const EIOS_BRAND_NAME = `${BRAND_PREFIX} EIOS` as const;
export const APPLICATIONS_BRAND_NAME = `${BRAND_PREFIX} Applications` as const;
export const PRODUCTS_BRAND_NAME = `${BRAND_PREFIX} Products` as const;

export function legalEntityProduct(productName: string) {
  return `${productName}, a product of ${LEGAL_ENTITY_NAME}`;
}
