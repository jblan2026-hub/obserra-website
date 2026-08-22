-- Project: ykmrlcfitsubqajgfnye (Obserra Applications Release Authority)
-- Purpose: Cover immutable commerce and rollback foreign-key enforcement paths.

create index if not exists applications_subscriptions_customer_binding_fk_idx
  on obserra_app_commerce.subscriptions (subject_id, tenant_id, stripe_customer_id);

create index if not exists rollbacks_target_stage_record_hash_idx
  on obserra_release_authority.rollbacks (target_stage_record_hash);
