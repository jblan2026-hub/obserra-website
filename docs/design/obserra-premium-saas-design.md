# Obserra Premium SaaS Design Contract

## Product brief

Obserra is presented as an enterprise decision intelligence, cybersecurity, protective intelligence, secure technology, and professional learning company. The public website must communicate credibility to executive buyers while giving direct access to applications and Academy. The Florida Class D experience must feel like a production learning management system while preserving its separate regulated authorization controls.

Primary audiences:

1. CEOs, CFOs, COOs, CIOs, CISOs, boards, risk and audit leaders evaluating enterprise services or EIOS.
2. Enterprise buyers evaluating secure applications and professional learning.
3. Florida Class D prospects preparing for regulated training once enrollment is authorized.

Primary goals:

1. Establish enterprise trust within the first viewport.
2. Make the value proposition understandable without technical translation.
3. Create clear conversion paths for executive consultation, EIOS, applications, Academy, and Florida Class D training.
4. Preserve legal, security, identity, payment, and regulated-training boundaries.
5. Meet WCAG AA interaction and readability expectations.

## Design philosophy

The visual direction is editorial enterprise luxury combined with executive mission control. The experience should feel controlled, consequential, and technically sophisticated without looking like a generic AI landing page.

The system uses asymmetry, large negative space, deeply tinted navy surfaces, restrained holographic blue, and Obserra gold as the single commercial accent. Surfaces use nested bezel treatment where elevation communicates hierarchy. Motion must be slow, weighty, and limited to transforms and opacity.

## Color system

Primary background: `#030914`
Raised navy: `#071926`
Strong raised navy: `#081e33`
Primary text: `#f3f8fb`
Secondary text: `#b8cfdb`
Holographic blue: `#82d5f3`
Obserra gold: `#f0bd62`
Success: `#69dab0`
Warning: `#dfbd72`

Do not introduce additional saturated accent colors. Avoid purple AI gradients, pure black, and generic gray cards.

## Typography

Primary family remains the existing Obserra `Sora` stack to avoid unnecessary font dependencies. Large display headings use tight tracking between `-0.05em` and `-0.065em`, balanced wrapping, and line heights below `1.0`. Body copy should remain below approximately 65 characters per line where possible and use line height around `1.7`.

Data values should use tabular figures where available.

## Layout

Homepage:

1. Floating glass enterprise navigation over the hero on capable browsers.
2. Editorial split hero with large decision-focused headline and an asymmetric Executive Mission Control preview.
3. Asymmetric pathway and risk-domain grids instead of uniform three-card rows.
4. Flagship EIOS platform section with large product visual.
5. Direct Applications and Academy commercial destinations in a weighted two-column composition.
6. Large contained final CTA rather than a flat full-width band.

Florida Class D LMS:

1. Same enterprise navigation language as the public website.
2. Double-bezel hero with a separate program-status control panel.
3. Clear distinction between software readiness and regulated authorization.
4. Asymmetric course metrics and structured curriculum cards.
5. Protected student journey shown as a governed sequence, not marketing decoration.
6. Licensing and authorization notice visually separated from promotional content.

## Interaction rules

1. Minimum interactive target height is 44 pixels.
2. Every interactive element requires visible keyboard focus.
3. Hover and active states use custom cubic-bezier motion and only transform/opacity-safe animation.
4. Respect `prefers-reduced-motion`.
5. No dead links or placeholder actions.
6. Gated regulated actions remain gated. Visual polish must never change authorization state.

## Accessibility

Target WCAG 2.1 AA.

1. Semantic headings and landmarks are required.
2. Decorative images use empty alt text and meaningful product images use descriptive alt text.
3. Status is communicated in text, never by color alone.
4. Legal and regulated notices remain readable at mobile widths.
5. Mobile layouts collapse to one column without overlap or horizontal scrolling.

## Security and compliance guardrails

1. Public marketing routes must not become dependent on a configured authentication provider.
2. Clerk and Supabase route ownership remain explicit and separate.
3. Florida Class D regulated credit, completion, certificates, and LIAS stay fail closed until separately authorized.
4. No service-role secrets or regulated learner data may enter client-rendered assets.
5. Existing CMMC, FDACS, release, and deployment gates remain mandatory.

## Performance targets

1. Preserve Next.js image optimization.
2. Avoid large client-only wrappers for purely visual effects.
3. Use CSS transforms and opacity for animation.
4. Avoid scrolling `backdrop-filter` surfaces. Blur is limited to fixed or navigation layers.
5. Respect existing production build and deployment-integrity tests.
