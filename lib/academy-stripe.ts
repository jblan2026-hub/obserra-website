import "server-only";

import Stripe from "stripe";
import { isProductionRuntime } from "./runtime-environment";

/**
 * Academy commerce uses a dedicated restricted Stripe key. It intentionally
 * does not fall back to the shared Applications commerce credential.
 */
export function getAcademyStripe() {
  const key = process.env.ACADEMY_STRIPE_SECRET_KEY?.trim() ?? "";
  const live = key.startsWith("rk_live_");
  const test = key.startsWith("rk_test_");
  if (!live && !test) throw new Error("Academy Stripe is not configured with a restricted key");
  if (isProductionRuntime() ? !live : !test) {
    throw new Error("Academy Stripe restricted key mode does not match the deployment");
  }
  return new Stripe(key, { apiVersion: "2026-07-29.dahlia", typescript: true });
}
