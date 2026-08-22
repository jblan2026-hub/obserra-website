# Obserra Applications Release Authority

This directory is the governed migration source for Supabase project
`ykmrlcfitsubqajgfnye` (`Obserra Applications Release Authority`). It is
separate from the Academy, FDACS, Identity, and EIOS database migration
histories.

Migrations in this directory are applied only to that exact project and are
verified against the Supabase database advisor after application. The release
authority ledger is append-only; schema hardening must preserve that invariant.

The separate `obserra_app_commerce` schema is the authoritative Applications
commerce ledger. Its tables are private and forced-RLS, and the website can use
only narrowly granted service-role RPCs. Stripe remains the payment processor;
the database is the durable authority for checkout idempotency, customer
mapping, webhook event processing, subscription snapshots, reversals, and
entitlement decisions.
