# Obserra Academy Stripe restricted-key runbook

Status: provider configuration pending. This source change does not create, reveal, rotate, or install a Stripe key and does not create a charge, refund, dispute, endpoint, or subscription.

## Dedicated production boundary

Academy commerce accepts only `ACADEMY_STRIPE_SECRET_KEY` with an `rk_live_` prefix in production and an `rk_test_` prefix outside production. It does not fall back to the shared `STRIPE_SECRET_KEY` used by other product areas. Academy webhook signature verification accepts only `ACADEMY_STRIPE_WEBHOOK_SECRET`.

Create and validate the restricted key in a Stripe sandbox first. Stripe documents that restricted keys default to no permissions and that permissions should be mapped from the exact API methods used, with `GET` requiring Read and `POST` requiring Write.

Candidate least-privilege permissions for the current Academy source are:

| Stripe resource | Permission | Academy use |
| --- | --- | --- |
| Checkout Sessions | Write | Create one hosted payment Session; Write includes Read for retrieve/list and durable replay. |
| Prices | Read | Retrieve the governed one-time Price before collection. |
| Products | Read | Expand and validate governed Product metadata. |
| Payment Intents | Read | Canonically verify paid Session and reversal linkage. |
| Charges | Read | Canonically verify refund and dispute linkage. |
| Account | Read | Non-mutating commerce-health verification. |
| Customers | Write, only if Stripe requires it for `customer_creation: "always"` | Checkout creates the Customer during confirmation; remove this permission if sandbox request logs prove it is unnecessary. |

All other Stripe resource permissions remain `None`. Do not grant refunds, disputes, payouts, balance, files, subscriptions, invoices, coupons, promotion codes, or Connect write access.

## Controlled activation sequence

1. Apply and verify the exact Academy database migrations through `20260815200000` in the authorized migration window.
2. Create a test-mode restricted key with only the candidate permissions above; store it as `ACADEMY_STRIPE_SECRET_KEY` in Preview only.
3. Configure a separate Preview webhook endpoint secret as `ACADEMY_STRIPE_WEBHOOK_SECRET` with exactly the five governed events.
4. Run the non-charge health checks and approved Stripe test-mode Checkout/refund/dispute lifecycle UAT. Review restricted-key request logs and remove any unused permission. Do not broaden a permission without a recorded failed endpoint and approved rationale.
5. Create a separate live restricted key with the verified permission set, configure Production-only environment variables, redeploy, and rerun exact-head health and webhook-subscription verification.
6. Keep production authorization and course credit disabled until all automated gates pass and the remaining human determinations are signed.

Required webhook events:

- `checkout.session.completed`
- `checkout.session.async_payment_succeeded`
- `charge.refunded`
- `charge.dispute.created`
- `charge.dispute.closed`

The canonical endpoint is `https://www.obserrallc.com/api/webhook/stripe`. Provider permissions, endpoint subscription, database migration, and live environment values remain externally verified blockers until evidence is captured from their control planes.
