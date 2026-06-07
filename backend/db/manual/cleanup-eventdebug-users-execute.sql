-- Permanently delete eventdebug-*@test.com users created by scripts/reproduce-event-save.sh
START TRANSACTION;

DROP TEMPORARY TABLE IF EXISTS tmp_eventdebug_user_ids;
CREATE TEMPORARY TABLE tmp_eventdebug_user_ids (id BIGINT PRIMARY KEY);

INSERT INTO tmp_eventdebug_user_ids (id)
SELECT u.id
FROM users u
WHERE LOWER(u.email) LIKE 'eventdebug-%@test.com'
  AND NOT EXISTS (
      SELECT 1
      FROM user_roles ur_admin
      INNER JOIN roles r_admin ON r_admin.id = ur_admin.role_id
      WHERE ur_admin.user_id = u.id
        AND r_admin.name = 'ROLE_ADMIN'
  );

DROP TEMPORARY TABLE IF EXISTS tmp_eventdebug_event_ids;
CREATE TEMPORARY TABLE tmp_eventdebug_event_ids (id BIGINT PRIMARY KEY);

INSERT INTO tmp_eventdebug_event_ids (id)
SELECT be.id
FROM business_events be
INNER JOIN business_profiles bp ON bp.id = be.business_profile_id
INNER JOIN tmp_eventdebug_user_ids t ON t.id = bp.user_id;

DROP TEMPORARY TABLE IF EXISTS tmp_eventdebug_booking_ids;
CREATE TEMPORARY TABLE tmp_eventdebug_booking_ids (id BIGINT PRIMARY KEY);

INSERT INTO tmp_eventdebug_booking_ids (id)
SELECT b.id FROM bookings b
INNER JOIN tmp_eventdebug_user_ids t ON t.id = b.user_id
UNION
SELECT b.id FROM bookings b
INNER JOIN tmp_eventdebug_event_ids e ON e.id = b.event_id;

DELETE p FROM payments p
INNER JOIN tmp_eventdebug_booking_ids b ON b.id = p.booking_id;

DELETE b FROM bookings b
INNER JOIN tmp_eventdebug_booking_ids t ON t.id = b.id;

DELETE FROM event_ratings
WHERE user_id IN (SELECT id FROM tmp_eventdebug_user_ids)
   OR event_id IN (SELECT id FROM tmp_eventdebug_event_ids);

DELETE FROM event_favorites
WHERE user_id IN (SELECT id FROM tmp_eventdebug_user_ids)
   OR event_id IN (SELECT id FROM tmp_eventdebug_event_ids);

DELETE ur FROM user_reports ur
INNER JOIN tmp_eventdebug_user_ids t ON t.id = ur.user_id;

DELETE mr FROM moderation_reports mr
INNER JOIN tmp_eventdebug_user_ids t ON t.id = mr.reporter_user_id;

DELETE pm FROM payment_methods pm
INNER JOIN tmp_eventdebug_user_ids t ON t.id = pm.user_id;

DELETE rt FROM refresh_tokens rt
INNER JOIN tmp_eventdebug_user_ids t ON t.id = rt.user_id;

DELETE ph FROM business_event_photos ph
INNER JOIN tmp_eventdebug_event_ids e ON e.id = ph.business_event_id;

DELETE ts FROM business_event_time_slots ts
INNER JOIN tmp_eventdebug_event_ids e ON e.id = ts.business_event_id;

DELETE be FROM business_events be
INNER JOIN tmp_eventdebug_event_ids e ON e.id = be.id;

DELETE bp FROM business_profiles bp
INNER JOIN tmp_eventdebug_user_ids t ON t.id = bp.user_id;

DELETE al FROM admin_activity_logs al
INNER JOIN tmp_eventdebug_user_ids t ON t.id = al.admin_user_id;

DELETE ur FROM user_roles ur
INNER JOIN tmp_eventdebug_user_ids t ON t.id = ur.user_id;

DELETE u FROM users u
INNER JOIN tmp_eventdebug_user_ids t ON t.id = u.id;

DROP TEMPORARY TABLE IF EXISTS tmp_eventdebug_booking_ids;
DROP TEMPORARY TABLE IF EXISTS tmp_eventdebug_event_ids;
DROP TEMPORARY TABLE IF EXISTS tmp_eventdebug_user_ids;

COMMIT;

SELECT 'eventdebug cleanup committed.' AS status;
