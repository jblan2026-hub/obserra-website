import type { Metadata } from "next";
import { ButtonLink, Field, KpiCard, PageIntro, Panel, StatusBadge } from "../components/ui/ObserraUI";
import { LEGAL_ENTITY_NAME } from "@/lib/legal-identity";

const ACADEMY_PRODUCT_NAME = "Obserra EPI Academy";
const EIOS_PRODUCT_NAME = "Obserra EPI EIOS";

export const metadata: Metadata = {
  title: "Design System",
  description: `${LEGAL_ENTITY_NAME} enterprise design system component validation page.`,
  robots: { index: false, follow: false },
};

export default function DesignSystemPage() {
  return (
    <main style={{ minHeight: "100vh", padding: "var(--obs-space-12) 0", background: "var(--obs-color-ink-950)", color: "var(--obs-color-text)" }}>
      <div className="obs-shell obs-stack" style={{ gap: "var(--obs-space-12)" }}>
        <PageIntro
          eyebrow={`${LEGAL_ENTITY_NAME} DESIGN SYSTEM V1.0`}
          title="Enterprise components for executive intelligence experiences."
          copy={`This non-indexed validation page proves the shared tokens, controls, cards, states, forms, and responsive behavior used by the ${LEGAL_ENTITY_NAME} website, ${ACADEMY_PRODUCT_NAME}, and ${EIOS_PRODUCT_NAME} product experiences.`}
          actions={<><ButtonLink href="/" variant="primary">Return home</ButtonLink><ButtonLink href="/trust" variant="secondary">Open Trust Center</ButtonLink></>}
        />

        <Panel title="Executive metrics" eyebrow="DASHBOARD PRIMITIVES" action={<StatusBadge tone="success">Operational</StatusBadge>}>
          <div className="obs-grid">
            <KpiCard label="Enterprise Health Index" value="87" trend="Up 6 points" status="Healthy" statusTone="success" className="obs-ds-span-4" />
            <KpiCard label="AI Governance" value="92%" trend="4 actions due" trendTone="warning" status="Review" statusTone="warning" className="obs-ds-span-4" />
            <KpiCard label="Executive Risk" value="Low" trend="No critical change" status="Stable" statusTone="success" className="obs-ds-span-4" />
          </div>
        </Panel>

        <Panel title="Actions and status" eyebrow="INTERACTION STANDARDS">
          <div className="obs-stack">
            <div className="obs-cluster">
              <ButtonLink href="/contact?interest=enterprise-consultation">Primary action</ButtonLink>
              <ButtonLink href="/eios" variant="secondary">Secondary action</ButtonLink>
              <ButtonLink href="/academy" variant="ghost">Ghost action</ButtonLink>
            </div>
            <div className="obs-cluster">
              <StatusBadge tone="success">Verified</StatusBadge>
              <StatusBadge tone="warning">Attention</StatusBadge>
              <StatusBadge tone="danger">Critical</StatusBadge>
              <StatusBadge>Informational</StatusBadge>
            </div>
          </div>
        </Panel>

        <Panel title="Accessible form controls" eyebrow="FORM PRIMITIVES">
          <form className="obs-grid">
            <Field label="Executive email" hint="Use a business email for enterprise inquiries."><input className="obs-input" type="email" name="email" autoComplete="email" /></Field>
            <Field label="Engagement type"><select className="obs-select" name="engagement" defaultValue=""><option value="" disabled>Select one</option><option>Executive advisory</option><option>{EIOS_PRODUCT_NAME}</option><option>Enterprise training</option></select></Field>
            <Field label="Business objective"><textarea className="obs-textarea" name="objective" /></Field>
          </form>
        </Panel>
      </div>
      <style>{`.obs-ds-span-4{grid-column:span 4}.obs-grid>.obs-label{grid-column:span 6}.obs-grid>.obs-label:last-child{grid-column:1/-1}@media(max-width:760px){.obs-ds-span-4,.obs-grid>.obs-label{grid-column:1/-1}}`}</style>
    </main>
  );
}
