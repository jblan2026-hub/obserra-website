"use client";

import { useState } from "react";
import "./commerce.css";

type Result = { created: number; alreadyConfigured: number; total: number } | { error: string };

export default function AcademyCommerceProvisioner() {
  const [result, setResult] = useState<Result | null>(null);
  const [working, setWorking] = useState(false);
  async function provision() {
    setWorking(true); setResult(null);
    try {
      const response = await fetch("/api/admin/academy-commerce", { method: "POST" });
      setResult(await response.json() as Result);
    } catch {
      setResult({ error: "The owner control room could not reach the commerce service." });
    } finally { setWorking(false); }
  }
  return <div className="commerce-provisioner"><p>Creates only missing Stripe products, prices, and internal payment-link records for the approved Academy catalog. It is idempotent and never exposes payment-provider secrets.</p><button type="button" onClick={provision} disabled={working}>{working ? "Provisioning secure catalog…" : "Provision secure Academy catalog"}</button>{result && ("error" in result ? <p className="commerce-error">{result.error}</p> : <p className="commerce-success">Catalog ready: {result.total} courses checked; {result.created} created and {result.alreadyConfigured} already configured.</p>)}</div>;
}
