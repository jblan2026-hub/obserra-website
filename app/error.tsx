"use client";

import { useEffect } from "react";
import Link from "next/link";
import { LEGAL_ENTITY_NAME } from "@/lib/legal-identity";
import "./commercial-pages.css";

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(`${LEGAL_ENTITY_NAME} page error`, error);
  }, [error]);

  return <main className="commercial-page"><div className="commercial-shell">
    <section className="commercial-hero"><p className="commercial-eyebrow">TEMPORARY INTERRUPTION</p><h1>We could not complete that request.</h1><p>Your information has not been submitted again. Retry the page, return to a verified destination, or contact {LEGAL_ENTITY_NAME} if the issue continues.</p></section>
    <section className="commercial-cta"><div><h2>Continue securely.</h2><p>Retry the current experience or return to the {LEGAL_ENTITY_NAME} homepage.</p></div><div style={{display:"flex",gap:12,flexWrap:"wrap"}}><button onClick={reset} style={{padding:"13px 18px",border:0,borderRadius:10,background:"#e6b456",color:"#071b30",fontWeight:900,cursor:"pointer"}}>Try again</button><Link href="/">Return home</Link></div></section>
  </div></main>;
}
