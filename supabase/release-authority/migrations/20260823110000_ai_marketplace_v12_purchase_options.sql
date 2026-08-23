-- v1.2 persists explicit catalog purchase-option semantics. Legacy values remain valid.
alter table obserra_ai_marketplace.checkout_attempts drop constraint if exists checkout_attempts_billing_interval_check;
alter table obserra_ai_marketplace.checkout_attempts add constraint checkout_attempts_billing_interval_check check (billing_interval in ('monthly','annual','one-time','recurring:month','recurring:year','one_time:once','team_license:once','activation:once'));
alter table obserra_ai_marketplace.entitlements drop constraint if exists entitlements_billing_interval_check;
alter table obserra_ai_marketplace.entitlements add constraint entitlements_billing_interval_check check (billing_interval in ('monthly','annual','one-time','recurring:month','recurring:year','one_time:once','team_license:once','activation:once'));
