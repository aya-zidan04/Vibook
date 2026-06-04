-- Preview smoke/E2E users and related row counts (read-only).
-- Run: ./backend/scripts/cleanup-smoke-test-users.sh
-- Or: mysql -u USER -p vibook_db < backend/db/manual/cleanup-smoke-test-users-preview.sql

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

    RETURN 0;
END$$

DELIMITER ;

SELECT '=== Users marked for deletion (ROLE_ADMIN excluded) ===' AS step;

SELECT
    u.id,
    u.email,
    u.first_name,
    u.last_name,
    u.enabled,
    u.created_at,
    GROUP_CONCAT(r.name ORDER BY r.name SEPARATOR ', ') AS roles
FROM users u
LEFT JOIN user_roles ur ON ur.user_id = u.id
LEFT JOIN roles r ON r.id = ur.role_id
WHERE is_smoke_test_user_email(u.email) = 1
  AND NOT EXISTS (
      SELECT 1
      FROM user_roles ur_admin
      INNER JOIN roles r_admin ON r_admin.id = ur_admin.role_id
      WHERE ur_admin.user_id = u.id
        AND r_admin.name = 'ROLE_ADMIN'
  )
GROUP BY u.id, u.email, u.first_name, u.last_name, u.enabled, u.created_at
ORDER BY u.created_at DESC;

SELECT '=== Row counts that will be removed ===' AS step;

SELECT
    (SELECT COUNT(*) FROM users u
     WHERE is_smoke_test_user_email(u.email) = 1
       AND NOT EXISTS (
           SELECT 1 FROM user_roles ur
           INNER JOIN roles r ON r.id = ur.role_id
           WHERE ur.user_id = u.id AND r.name = 'ROLE_ADMIN')) AS users_to_delete,
    (SELECT COUNT(*) FROM business_profiles bp
     INNER JOIN users u ON u.id = bp.user_id
     WHERE is_smoke_test_user_email(u.email) = 1
       AND NOT EXISTS (
           SELECT 1 FROM user_roles ur
           INNER JOIN roles r ON r.id = ur.role_id
           WHERE ur.user_id = u.id AND r.name = 'ROLE_ADMIN')) AS business_profiles,
    (SELECT COUNT(*) FROM bookings b
     WHERE b.user_id IN (
         SELECT u.id FROM users u
         WHERE is_smoke_test_user_email(u.email) = 1
           AND NOT EXISTS (
               SELECT 1 FROM user_roles ur
               INNER JOIN roles r ON r.id = ur.role_id
               WHERE ur.user_id = u.id AND r.name = 'ROLE_ADMIN'))
        OR b.event_id IN (
            SELECT be.id FROM business_events be
            INNER JOIN business_profiles bp ON bp.id = be.business_profile_id
            INNER JOIN users u ON u.id = bp.user_id
            WHERE is_smoke_test_user_email(u.email) = 1
              AND NOT EXISTS (
                  SELECT 1 FROM user_roles ur
                  INNER JOIN roles r ON r.id = ur.role_id
                  WHERE ur.user_id = u.id AND r.name = 'ROLE_ADMIN'))) AS bookings,
    (SELECT COUNT(*) FROM event_favorites f
     INNER JOIN users u ON u.id = f.user_id
     WHERE is_smoke_test_user_email(u.email) = 1
       AND NOT EXISTS (
           SELECT 1 FROM user_roles ur
           INNER JOIN roles r ON r.id = ur.role_id
           WHERE ur.user_id = u.id AND r.name = 'ROLE_ADMIN')) AS favorites,
    (SELECT COUNT(*) FROM event_ratings er
     INNER JOIN users u ON u.id = er.user_id
     WHERE is_smoke_test_user_email(u.email) = 1
       AND NOT EXISTS (
           SELECT 1 FROM user_roles ur
           INNER JOIN roles r ON r.id = ur.role_id
           WHERE ur.user_id = u.id AND r.name = 'ROLE_ADMIN')) AS ratings,
    (SELECT COUNT(*) FROM refresh_tokens rt
     INNER JOIN users u ON u.id = rt.user_id
     WHERE is_smoke_test_user_email(u.email) = 1
       AND NOT EXISTS (
           SELECT 1 FROM user_roles ur
           INNER JOIN roles r ON r.id = ur.role_id
           WHERE ur.user_id = u.id AND r.name = 'ROLE_ADMIN')) AS refresh_tokens;

SELECT '=== Admins kept (never deleted) ===' AS step;

SELECT u.id, u.email, GROUP_CONCAT(r.name ORDER BY r.name SEPARATOR ', ') AS roles
FROM users u
INNER JOIN user_roles ur ON ur.user_id = u.id
INNER JOIN roles r ON r.id = ur.role_id
WHERE r.name = 'ROLE_ADMIN'
GROUP BY u.id, u.email;
