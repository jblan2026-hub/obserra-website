# Obserra Component Library

The production primitives are exported from `app/components/ui/ObserraUI.tsx` and styled by `app/design-system.css`.

## Available primitives

### ButtonLink

Use for navigation and calls to action. Variants are `primary`, `secondary`, and `ghost`. Internal links use Next.js navigation automatically. External and email links render as anchors.

### Button

Use for client actions and form controls. The default type is `button` to prevent accidental form submission.

### Card

Base surface for commercial, dashboard, and evidence content. Enable `interactive` only when the card contains a meaningful action.

### StatusBadge

Semantic status treatment. Supported tones are neutral, success, warning, and danger. Labels must describe the state without relying on color.

### KpiCard

Executive metric card with label, value, trend, and status. Values must be sourced from evidence or clearly marked demonstration data.

### Panel

Structured dashboard or content region with eyebrow, heading, optional action, and body.

### Field

Accessible label and hint wrapper for native inputs, selects, and textareas.

### PageIntro

Reusable page introduction with one H1, supporting copy, and primary actions.

## Usage rules

1. Import primitives from `app/components/ui/ObserraUI`.
2. Do not copy component markup into page files.
3. Prefer semantic HTML and native controls.
4. Page level styles may control placement but should not redefine component colors, focus behavior, or interaction states.
5. Components must remain server compatible unless client behavior is required.

## Validation

The non-indexed `/design-system` route renders representative states and responsive behavior. It is a validation surface, not a public marketing destination.
