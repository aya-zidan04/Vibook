-- Destructive one-time cleanup (MySQL). Run ONLY after preview.
-- Run: ./backend/scripts/cleanup-smoke-test-users.sh --execute
-- Requires typing YES to confirm.

DROP FUNCTION IF EXISTS is_smoke_test_user_email;

DELIMITER $$

CREATE FUNCTION is_smoke_test_user_email(p_email VARCHAR(120))
RETURNS TINYINT
DETERMINISTIC
NO SQL
BEGIN
    DECLARE v_norm VARCHAR(120);
    DECLARE v_local VARCHAR(120);
    DECLARE v_domain VARCHAR(120);
    DECLARE v_at INT;

    IF p_email IS NULL OR TRIM(p_email) = '' THEN
        RETURN 0;
    END IF;

    SET v_norm = LOWER(TRIM(p_email));
    SET v_at = LOCATE('@', v_norm);

    IF v_at > 0 THEN
        SET v_local = SUBSTRING(v_norm, 1, v_at - 1);
        SET v_domain = SUBSTRING(v_norm, v_at + 1);
    ELSE
        SET v_local = v_norm;
        SET v_domain = '';
    END IF;

    IF v_domain = 'vibook.test' THEN
        RETURN 1;
    END IF;
    IF v_norm LIKE 'smoke\_%' OR v_local LIKE 'smoke%' THEN
        RETURN 1;
    END IF;
    IF v_local LIKE 'biz\_%' AND (v_domain = 'vibook.test' OR v_domain LIKE '%.test') THEN
        RETURN 1;
    END IF;
    IF v_norm LIKE '%+test%' THEN
        RETURN 1;
    END IF;
    IF v_norm LIKE '%@example.%' THEN
        RETURN 1;
    END IF;
    IF v_norm LIKE 'demo@%' THEN
        RETURN 1;
    END IF;
    IF v_local LIKE 'eventdebug-%' AND v_domain = 'test.com' THEN
        RETURN 1;
    END IF;

    RETURN 0;
END$$

DELIMITER ;

START TRANSACTION;

DROP TEMPORARY TABLE IF EXISTS tmp_smoke_user_ids;
CREATE TEMPORARY TABLE tmp_smoke_user_ids (
    id BIGINT PRIMARY KEY
);

INSERT INTO tmp_smoke_user_ids (id)
SELECT u.id
FROM users u
WHERE is_smoke_test_user_email(u.email) = 1
  AND NOT EXISTS (
      SELECT 1
      FROM user_roles ur_admin
      INNER JOIN roles r_admin ON r_admin.id = ur_admin.role_id
      WHERE ur_admin.user_id = u.id
        AND r_admin.name = 'ROLE_ADMIN'
  );

DROP TEMPORARY TABLE IF EXISTS tmp_smoke_event_ids;
CREATE TEMPORARY TABLE tmp_smoke_event_ids (
    id BIGINT PRIMARY KEY
);

INSERT INTO tmp_smoke_event_ids (id)
SELECT be.id
FROM business_events be
INNER JOIN business_profiles bp ON bp.id = be.business_profile_id
INNER JOIN tmp_smoke_user_ids t ON t.id = bp.user_id;

DROP TEMPORARY TABLE IF EXISTS tmp_smoke_booking_ids;
CREATE TEMPORARY TABLE tmp_smoke_booking_ids (
    id BIGINT PRIMARY KEY
);

INSERT INTO tmp_smoke_booking_ids (id)
SELECT b.id FROM bookings b
INNER JOIN tmp_smoke_user_ids t ON t.id = b.user_id
UNION
SELECT b.id FROM bookings b
INNER JOIN tmp_smoke_event_ids e ON e.id = b.event_id;

DELETE p FROM payments p
INNER JOIN tmp_smoke_booking_ids b ON b.id = p.booking_id;

DELETE b FROM bookings b
INNER JOIN tmp_smoke_booking_ids t ON t.id = b.id;

DELETE FROM event_ratings
WHERE user_id IN (SELECT id FROM tmp_smoke_user_ids)
   OR event_id IN (SELECT id FROM tmp_smoke_event_ids);

DELETE FROM event_favorites
WHERE user_id IN (SELECT id FROM tmp_smoke_user_ids)
   OR event_id IN (SELECT id FROM tmp_smoke_event_ids);

DELETE ur FROM user_reports ur
INNER JOIN tmp_smoke_user_ids t ON t.id = ur.user_id;

DELETE mr FROM moderation_reports mr
INNER JOIN tmp_smoke_user_ids t ON t.id = mr.reporter_user_id;

DELETE pm FROM payment_methods pm
INNER JOIN tmp_smoke_user_ids t ON t.id = pm.user_id;

DELETE rt FROM refresh_tokens rt
INNER JOIN tmp_smoke_user_ids t ON t.id = rt.user_id;

DELETE ph FROM business_event_photos ph
INNER JOIN tmp_smoke_event_ids e ON e.id = ph.business_event_id;

DELETE ts FROM business_event_time_slots ts
INNER JOIN tmp_smoke_event_ids e ON e.id = ts.business_event_id;

DELETE be FROM business_events be
INNER JOIN tmp_smoke_event_ids e ON e.id = be.id;

DELETE bp FROM business_profiles bp
INNER JOIN tmp_smoke_user_ids t ON t.id = bp.user_id;

DELETE al FROM admin_activity_logs al
INNER JOIN tmp_smoke_user_ids t ON t.id = al.admin_user_id;

DELETE ur FROM user_roles ur
INNER JOIN tmp_smoke_user_ids t ON t.id = ur.user_id;

DELETE u FROM users u
INNER JOIN tmp_smoke_user_ids t ON t.id = u.id;

DROP TEMPORARY TABLE IF EXISTS tmp_smoke_booking_ids;
DROP TEMPORARY TABLE IF EXISTS tmp_smoke_event_ids;
DROP TEMPORARY TABLE IF EXISTS tmp_smoke_user_ids;

DROP FUNCTION IF EXISTS is_smoke_test_user_email;

COMMIT;

SELECT 'Cleanup committed.' AS status;
