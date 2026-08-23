import type { Metadata } from "next";
import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { marketplaceV12ProtectedDeliveryConfigured } from "../../../lib/ai-marketplace-delivery";
import "../marketplace.css";

export const metadata: Metadata = { title: "Customer Hangar Status | Obserra EPI", description: "Protected AI Marketplace delivery and installation availability." };
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export default async function MarketplaceHangarPage() {
  const { userId } = await auth();
  const deliveryConfigured = marketplaceV12ProtectedDeliveryConfigured();
  return <main className="ai-marketplace"><header className="ai-marketplace__nav"><Link href="/ai-marketplace">OBSERRA EPI</Link><nav aria-label="Marketplace navigation"><Link href="/ai-marketplace">Marketplace</Link><Link href="/portal">Customer portal</Link></nav></header><section className="ai-marketplace__hangar"><p className="ai-marketplace__eyebrow">Customer hangar</p><h1>Protected delivery status</h1><p>The hangar never treats a catalog record, offer selection, or sign-in as a delivery entitlement.</p><div><article><span>Protected delivery configuration</span><strong>{deliveryConfigured ? "Configured, but entitlement validation is still required" : "Unavailable — protected delivery controls are not configured"}</strong><p>{deliveryConfigured ? "A signed-release path may be configured. Access remains denied unless an authenticated customer has a verified product entitlement and a governed release is available." : "No customer download or release URL is available from this environment."}</p></article><article><span>Installation bridge</span><strong>Unavailable</strong><p>Installation destinations and grants are not published by this catalog. No installation is initiated from the hangar.</p></article><article><span>Customer access</span><strong>{userId ? "Authenticated; product-specific entitlement still required" : "Sign in required before product access can be checked"}</strong><p>Product access checks are server-scoped to the authenticated customer and current organization tenant. No subject or tenant identifier is exposed to the page.</p></article></div><Link className="ai-marketplace__contact-cta" href={userId ? "/portal" : "/sign-in?redirect_url=/ai-marketplace/hangar"}>{userId ? "Open customer portal" : "Sign in to check access"}</Link></section></main>;
}
