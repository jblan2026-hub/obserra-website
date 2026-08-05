# Obserra Accessibility Standard

Obserra targets WCAG 2.2 AA for public website, Academy, EIOS, and customer experiences.

## Required controls

- One descriptive H1 per page.
- Semantic landmarks and heading order.
- Keyboard access for every interactive control.
- Visible focus indicators using the shared focus token.
- Minimum 44 by 44 pixel interactive targets.
- Descriptive alternative text for meaningful images.
- Empty alternative text for decorative images.
- Form labels, instructions, errors, and success states connected programmatically.
- Status and risk meaning communicated through text, not color alone.
- Reduced motion support.
- Responsive reflow without horizontal scrolling at 320 CSS pixels.
- Sufficient text and control contrast.

## Testing gate

Every production release must include keyboard review, mobile reflow review, heading validation, form validation, and automated accessibility checks where tooling is available. Accessibility regressions block release unless a documented exception is approved with remediation timing.
