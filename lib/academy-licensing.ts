import "server-only";

export const ACADEMY_LICENSED_SALES_ENV = "OBSERRA_ACADEMY_LICENSED_SALES_ENABLED" as const;

export function academyLicensedSalesEnabled() {
  return process.env[ACADEMY_LICENSED_SALES_ENV]?.trim().toLowerCase() === "enabled";
}
