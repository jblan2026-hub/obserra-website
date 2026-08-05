# Obserra Website Architecture

## Product role

The website is the commercial front end of the Obserra platform. It connects executive advisory, protection and intelligence services, EIOS product experiences, applications, Academy commerce, trust resources, and future customer portal capabilities.

## Frontend architecture

- Next.js App Router with React and TypeScript.
- Server components by default.
- Client components only for stateful interaction, analytics, authentication, or browser APIs.
- Global design tokens in `app/design-system.css`.
- Shared typed UI primitives in `app/components/ui`.
- Page specific styles remain colocated with their route.
- Brand assets are served from `public/brand` and approved domain folders.

## Shared platform rules

1. Build common behavior once and consume it everywhere.
2. Do not add a parallel styling framework or duplicate component library.
3. Keep commerce, authentication, analytics, and certificate logic separate from presentation components.
4. All public pages require metadata, responsive behavior, accessibility, and production smoke coverage.
5. Secure defaults, least privilege, controlled data handling, and auditability guide integration decisions.

## Release sequence

Sprint 1 establishes the shared design foundation. Sprint 2 consumes it for Executive Mission Control. Later releases extend the same primitives to EIOS, Applications, Academy, Trust, and the customer portal.
