-- Preview legacy re-approval profiles stuck in DRAFT (old flow).
-- Safe to run repeatedly; does not modify data.

SELECT
    id,
    business_name,
    status,
    requires_re_approval,
    previously_approved,
    approved_at,
    updated_at
FROM business_profiles
WHERE status = 'DRAFT'
  AND requires_re_approval = 1
  AND (previously_approved = 1 OR approved_at IS NOT NULL);
