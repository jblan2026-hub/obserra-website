-- Publish the reviewed Obserra Academy baseline catalog through the secure control plane.
-- This migration is intentionally idempotent and never overwrites later operator decisions.
-- Florida Class D regulated training is not part of this baseline list.

with baseline(course_id) as (
  values
    ('cybersecurity-foundations'),
    ('generative-ai-business-leaders'),
    ('llms-for-leaders'),
    ('security-awareness-high-risk'),
    ('executive-travel-risk'),
    ('digital-exposure-executive-privacy'),
    ('ai-ready-workforce'),
    ('coding-for-cyber-leaders'),
    ('python-security-automation'),
    ('api-security-integration'),
    ('prompt-engineering-secure-workflows'),
    ('zero-trust-strategy'),
    ('cloud-security-executives'),
    ('identity-security-access-governance'),
    ('vulnerability-management'),
    ('executive-protection-fundamentals'),
    ('insider-threat-awareness'),
    ('low-code-security-automation'),
    ('cybersecurity-governance-policy'),
    ('ai-executive-decision-making'),
    ('ai-data-privacy-ip'),
    ('executive-dashboards-data-ai'),
    ('cybersecurity-business-leaders'),
    ('building-trusted-teams'),
    ('security-intelligence-careers'),
    ('secure-enterprise-llm-deployment'),
    ('ai-risk-ethics-governance'),
    ('ai-policy-responsible-use'),
    ('secure-ai-native-apps'),
    ('secure-software-development-lifecycle'),
    ('cloud-native-app-security'),
    ('devsecops-enterprise-teams'),
    ('incident-response-leadership'),
    ('ransomware-readiness'),
    ('digital-forensics-evidence'),
    ('protective-intelligence-corporate-security'),
    ('third-party-cyber-risk'),
    ('business-continuity-cyber-resilience'),
    ('crisis-communications-executives'),
    ('executive-threat-assessment'),
    ('ai-red-teaming-model-risk'),
    ('cyber-risk-assessment'),
    ('enterprise-risk-technology'),
    ('building-security-program'),
    ('crisis-leadership-cisos'),
    ('board-communication-cybersecurity'),
    ('cybersecurity-executive-metrics'),
    ('workplace-violence-threat-management'),
    ('family-security-digital-safety'),
    ('regulatory-readiness-security'),
    ('cybersecurity-budget-business-case'),
    ('ciso-leadership-playbook'),
    ('becoming-a-strategic-ciso'),
    ('ciso-career-executive-presence'),
    ('eios-enterprise-intelligence-overview'),
    ('executive-decision-making-pressure'),
    ('ethical-leadership-ai'),
    ('leading-through-cyber-crisis'),
    ('custom-ai-native-app-strategy'),
    ('data-driven-risk-intelligence')
),
inserted as (
  insert into public.academy_course_controls (
    course_id,
    lifecycle,
    public_visible,
    purchase_enabled,
    preserve_existing_entitlements,
    reason,
    revision,
    updated_by
  )
  select
    baseline.course_id,
    'published',
    true,
    true,
    true,
    'Reviewed website baseline catalog publication',
    1,
    'system:baseline-reviewed-catalog'
  from baseline
  on conflict (course_id) do nothing
  returning
    course_id,
    lifecycle,
    public_visible,
    purchase_enabled,
    preserve_existing_entitlements,
    reason,
    revision,
    updated_by,
    created_at,
    updated_at
)
insert into public.academy_course_control_events (
  course_id,
  actor_user_id,
  action,
  request_id,
  previous_state,
  next_state
)
select
  inserted.course_id,
  'system:baseline-reviewed-catalog',
  'baseline-published',
  gen_random_uuid(),
  null,
  jsonb_build_object(
    'course_id', inserted.course_id,
    'lifecycle', inserted.lifecycle,
    'public_visible', inserted.public_visible,
    'purchase_enabled', inserted.purchase_enabled,
    'preserve_existing_entitlements', inserted.preserve_existing_entitlements,
    'reason', inserted.reason,
    'revision', inserted.revision,
    'updated_by', inserted.updated_by,
    'created_at', inserted.created_at,
    'updated_at', inserted.updated_at
  )
from inserted;
