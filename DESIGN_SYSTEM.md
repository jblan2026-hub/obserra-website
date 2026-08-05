# Obserra Enterprise Design System

Version 1.0

## Purpose

The Obserra design system is the shared visual and interaction foundation for the public website, Obserra Academy, EIOS product experiences, executive dashboards, customer portals, and future commercial applications.

## Principles

1. Executive clarity before decoration.
2. Secure by design and secure by default.
3. Accessible interaction with a WCAG 2.2 AA target.
4. Responsive behavior from small mobile devices through large executive displays.
5. Shared primitives before page specific styling.
6. Evidence, status, ownership, and action must remain visually distinguishable.

## Brand palette

The canonical tokens are defined in `app/design-system.css`.

- Ink 950: deepest application background.
- Ink 900 through 700: layered surfaces and navigation.
- Blue 500 through 100: intelligence, information, and technical emphasis.
- Gold 600 through 300: executive emphasis and primary action.
- Success, warning, danger, and information colors are reserved for status semantics.

Do not introduce new brand colors directly in components. Extend the token file through review when a new semantic requirement is proven.

## Typography

Use the shared sans stack and the defined scale. Headings should be concise, sentence case, and visually dominant. Body copy should favor readable line lengths and substantive paragraphs. Monospace text is reserved for identifiers, evidence references, system states, and technical values.

## Spacing and layout

Use the `--obs-space-*` scale. Primary content uses `.obs-shell`. Use `.obs-stack`, `.obs-cluster`, and `.obs-grid` before creating custom page layout utilities.

## Motion

Motion must communicate state or hierarchy. All motion uses the shared duration and easing tokens. Reduced motion preferences must be honored.

## Accessibility

Interactive controls require visible focus states, descriptive accessible names, keyboard operability, sufficient contrast, and a minimum 44 pixel target size. Status cannot rely on color alone.

## Governance

New shared components belong in `app/components/ui`. Page specific components may consume shared primitives but must not duplicate their behavior. Breaking token or primitive changes require production validation and release notes.
