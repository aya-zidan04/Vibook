-- One-time data fix: move legacy re-approval submissions from DRAFT to PENDING_REVIEW.
-- Run preview script first. Idempotent after rows are migrated.

UPDATE business_profiles
SET status = 'PENDING_REVIEW',
    updated_at = UTC_TIMESTAMP(3)
WHERE status = 'DRAFT'
  AND requires_re_approval = 1
  AND (previously_approved = 1 OR approved_at IS NOT NULL);
