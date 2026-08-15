# Obserra Identity project migrations

This directory is exclusively for the dedicated **Obserra Identity** Supabase
project (`ftkjhmtfyfkartfsnkjb`). It is not part of the root Supabase migration
lineage used by the separate Academy and FDACS databases.

Do not run `supabase db push` from the repository root for these files. Apply an
Identity migration only through a project-ref-pinned, reviewed promotion step
that targets `ftkjhmtfyfkartfsnkjb`, records the exact SQL SHA-256, verifies the
post-migration privileges and security advisors, and keeps every application
runtime flag disabled until the application release is independently approved.

No migration in this directory authorizes production authentication, public
registration, learner access, payments, training credit, completion, certificate
issuance, or LIAS activity.

## Forward hardening and advisor disposition

The authority migration `20260815220000_obserra_identity_authority.sql` is an applied, immutable artifact. Do not rewrite `20260815220000_obserra_identity_authority.sql`; every later change must be a new forward migration.

Migration `20260815233000_identity_provider_subject_fk_index.sql` resolves advisor lint `0001_unindexed_foreign_keys` for `identity_private.provider_links(provider_subject)`. The composite primary key begins with `provider`, so it does not replace this foreign-key index.

Advisor lint `0029_authenticated_security_definer_function_executable` is intentionally dispositioned for `public.obserra_current_identity_authority(uuid)` and `public.obserra_request_owner_activation(uuid)`. Each is an intentional per-user privileged operation: execution is authenticated-only, the caller cannot choose a subject, session, principal, or role, `search_path` is empty, all objects are schema-qualified, and the activation request can append an audit event only after the same fresh authority check. Switching to invoker rights would require exposing private authority and Supabase Auth relations to authenticated users; that is prohibited. Closed invitation-only signup remains a release gate.

Advisor lint `0008_rls_enabled_no_policy` is intentional for the three `identity_private` tables. Forced RLS with no policies is the deny-all client boundary; the private schema is not API-exposed, authenticated and anonymous roles have no table privileges, service-role table access is read-only, and governed writes occur only through narrowly granted definer RPCs. Adding permissive policies to silence this informational finding would weaken the boundary.
