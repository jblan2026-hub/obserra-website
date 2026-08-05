import { platformServices } from "./registry";
import {
  ClerkIdentityService,
  ClerkOrganizationService,
  ClerkTenantService,
  StripeBillingService,
  StripeLicensingService,
  UnifiedPlatformEntitlementService,
} from "./adapters/production";

let initialized = false;

export function initializeProductionPlatformServices() {
  if (initialized) return platformServices;

  const services = [
    new ClerkIdentityService(),
    new ClerkOrganizationService(),
    new ClerkTenantService(),
    new StripeLicensingService(),
    new UnifiedPlatformEntitlementService(),
    new StripeBillingService(),
  ] as const;

  for (const service of services) {
    if (!platformServices.has(service.name)) {
      platformServices.register(service);
    }
  }

  initialized = true;
  return platformServices;
}
