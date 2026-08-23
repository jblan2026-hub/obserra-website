import { NextResponse } from "next/server";
import { aiMarketplaceBindingCoverage } from "../../../../../lib/ai-marketplace-payment-bindings";
import { applicationsCommerceConfigured, getApplicationsStripe } from "../../../../../lib/applications-stripe";
import { ensureApplicationsRuntimeSecrets } from "../../../../../lib/production-runtime-secrets";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const coverage = aiMarketplaceBindingCoverage();
  try {
    await ensureApplicationsRuntimeSecrets();
    const configured = applicationsCommerceConfigured();
    const account = configured ? await getApplicationsStripe().accounts.retrieve(null) : null;
    const operational = coverage.complete && configured && account?.charges_enabled === true;
    return NextResponse.json({
      contract: "ai-marketplace-commerce-health-v1",
      operational,
      productBindings: coverage,
      paymentProvider: configured ? "stripe" : "unavailable",
      chargesEnabled: account?.charges_enabled === true,
    }, { status: operational ? 200 : 503, headers: { "cache-control": "no-store" } });
  } catch {
    return NextResponse.json({
      contract: "ai-marketplace-commerce-health-v1",
      operational: false,
      productBindings: coverage,
      paymentProvider: "unavailable",
      chargesEnabled: false,
    }, { status: 503, headers: { "cache-control": "no-store" } });
  }
}
