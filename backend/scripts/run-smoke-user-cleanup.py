#!/usr/bin/env python3
"""Execute smoke/E2E user cleanup against MySQL. Mirrors cleanup-smoke-test-users-execute.sql."""

from __future__ import annotations

import os
import sys

try:
    import pymysql
except ImportError:
    print("Install pymysql: python3 -m pip install pymysql", file=sys.stderr)
    sys.exit(1)

CREATE_FUNCTION_SQL = """
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
    IF v_norm LIKE 'smoke\\_%' OR v_local LIKE 'smoke%%' THEN
        RETURN 1;
    END IF;
    IF v_local LIKE 'biz\\_%' AND (v_domain = 'vibook.test' OR v_domain LIKE '%%.test') THEN
        RETURN 1;
    END IF;
    IF v_norm LIKE '%%+test%%' THEN
        RETURN 1;
    END IF;
    IF v_norm LIKE '%%@example.%%' THEN
        RETURN 1;
    END IF;
    IF v_norm LIKE 'demo@%%' THEN
        RETURN 1;
    END IF;

    RETURN 0;
END
"""

DELETE_STEPS = [
    ("DROP tmp_smoke_user_ids", "DROP TEMPORARY TABLE IF EXISTS tmp_smoke_user_ids"),
    ("CREATE tmp_smoke_user_ids", "CREATE TEMPORARY TABLE tmp_smoke_user_ids (id BIGINT PRIMARY KEY)"),
    (
        "INSERT tmp_smoke_user_ids",
        """
        INSERT INTO tmp_smoke_user_ids (id)
        SELECT u.id FROM users u
        WHERE is_smoke_test_user_email(u.email) = 1
          AND NOT EXISTS (
              SELECT 1 FROM user_roles ur_admin
              INNER JOIN roles r_admin ON r_admin.id = ur_admin.role_id
              WHERE ur_admin.user_id = u.id AND r_admin.name = 'ROLE_ADMIN')
        """,
    ),
    ("DROP tmp_smoke_event_ids", "DROP TEMPORARY TABLE IF EXISTS tmp_smoke_event_ids"),
    ("CREATE tmp_smoke_event_ids", "CREATE TEMPORARY TABLE tmp_smoke_event_ids (id BIGINT PRIMARY KEY)"),
    (
        "INSERT tmp_smoke_event_ids",
        """
        INSERT INTO tmp_smoke_event_ids (id)
        SELECT be.id FROM business_events be
        INNER JOIN business_profiles bp ON bp.id = be.business_profile_id
        INNER JOIN tmp_smoke_user_ids t ON t.id = bp.user_id
        """,
    ),
    ("DROP tmp_smoke_booking_ids", "DROP TEMPORARY TABLE IF EXISTS tmp_smoke_booking_ids"),
    ("CREATE tmp_smoke_booking_ids", "CREATE TEMPORARY TABLE tmp_smoke_booking_ids (id BIGINT PRIMARY KEY)"),
    (
        "INSERT tmp_smoke_booking_ids",
        """
        INSERT INTO tmp_smoke_booking_ids (id)
        SELECT b.id FROM bookings b INNER JOIN tmp_smoke_user_ids t ON t.id = b.user_id
        UNION
        SELECT b.id FROM bookings b INNER JOIN tmp_smoke_event_ids e ON e.id = b.event_id
        """,
    ),
    ("DELETE payments", "DELETE p FROM payments p INNER JOIN tmp_smoke_booking_ids b ON b.id = p.booking_id"),
    ("DELETE bookings", "DELETE b FROM bookings b INNER JOIN tmp_smoke_booking_ids t ON t.id = b.id"),
    (
        "DELETE event_ratings",
        "DELETE FROM event_ratings WHERE user_id IN (SELECT id FROM tmp_smoke_user_ids) "
        "OR event_id IN (SELECT id FROM tmp_smoke_event_ids)",
    ),
    (
        "DELETE event_favorites",
        "DELETE FROM event_favorites WHERE user_id IN (SELECT id FROM tmp_smoke_user_ids) "
        "OR event_id IN (SELECT id FROM tmp_smoke_event_ids)",
    ),
    ("DELETE user_reports", "DELETE ur FROM user_reports ur INNER JOIN tmp_smoke_user_ids t ON t.id = ur.user_id"),
    (
        "DELETE moderation_reports",
        "DELETE mr FROM moderation_reports mr INNER JOIN tmp_smoke_user_ids t ON t.id = mr.reporter_user_id",
    ),
    ("DELETE payment_methods", "DELETE pm FROM payment_methods pm INNER JOIN tmp_smoke_user_ids t ON t.id = pm.user_id"),
    ("DELETE refresh_tokens", "DELETE rt FROM refresh_tokens rt INNER JOIN tmp_smoke_user_ids t ON t.id = rt.user_id"),
    (
        "DELETE business_event_photos",
        "DELETE ph FROM business_event_photos ph INNER JOIN tmp_smoke_event_ids e ON e.id = ph.business_event_id",
    ),
    (
        "DELETE business_event_time_slots",
        "DELETE ts FROM business_event_time_slots ts INNER JOIN tmp_smoke_event_ids e ON e.id = ts.business_event_id",
    ),
    ("DELETE business_events", "DELETE be FROM business_events be INNER JOIN tmp_smoke_event_ids e ON e.id = be.id"),
    ("DELETE business_profiles", "DELETE bp FROM business_profiles bp INNER JOIN tmp_smoke_user_ids t ON t.id = bp.user_id"),
    (
        "DELETE admin_activity_logs",
        "DELETE al FROM admin_activity_logs al INNER JOIN tmp_smoke_user_ids t ON t.id = al.admin_user_id",
    ),
    ("DELETE user_roles", "DELETE ur FROM user_roles ur INNER JOIN tmp_smoke_user_ids t ON t.id = ur.user_id"),
    ("DELETE users", "DELETE u FROM users u INNER JOIN tmp_smoke_user_ids t ON t.id = u.id"),
]


def connect():
    return pymysql.connect(
        host=os.environ.get("DB_HOST", "localhost"),
        port=int(os.environ.get("DB_PORT", "3306")),
        user=os.environ.get("DB_USERNAME", os.environ.get("DB_USER", "root")),
        password=os.environ.get("DB_PASSWORD", "1234"),
        database=os.environ.get("DB_NAME", "vibook_db"),
        autocommit=False,
    )


def count_users(cur) -> int:
    cur.execute("SELECT COUNT(*) FROM users")
    return int(cur.fetchone()[0])


def count_smoke_users(cur) -> int:
    cur.execute(
        """
        SELECT COUNT(*) FROM users u
        WHERE is_smoke_test_user_email(u.email) = 1
          AND NOT EXISTS (
              SELECT 1 FROM user_roles ur
              INNER JOIN roles r ON r.id = ur.role_id
              WHERE ur.user_id = u.id AND r.name = 'ROLE_ADMIN')
        """
    )
    return int(cur.fetchone()[0])


def list_smoke_users(cur):
    cur.execute(
        """
        SELECT u.id, u.email FROM users u
        WHERE is_smoke_test_user_email(u.email) = 1
          AND NOT EXISTS (
              SELECT 1 FROM user_roles ur
              INNER JOIN roles r ON r.id = ur.role_id
              WHERE ur.user_id = u.id AND r.name = 'ROLE_ADMIN')
        ORDER BY u.id
        """
    )
    return cur.fetchall()


def list_admins(cur):
    cur.execute(
        """
        SELECT u.id, u.email FROM users u
        INNER JOIN user_roles ur ON ur.user_id = u.id
        INNER JOIN roles r ON r.id = ur.role_id
        WHERE r.name = 'ROLE_ADMIN'
        ORDER BY u.id
        """
    )
    return cur.fetchall()


def main() -> int:
    conn = connect()
    try:
        cur = conn.cursor()

        cur.execute("DROP FUNCTION IF EXISTS is_smoke_test_user_email")
        cur.execute(CREATE_FUNCTION_SQL.strip())

        before_total = count_users(cur)
        before_smoke = count_smoke_users(cur)
        smoke_rows = list_smoke_users(cur)
        admins = list_admins(cur)

        print("=== BEFORE ===")
        print(f"Total users: {before_total}")
        print(f"Smoke/test users to delete: {before_smoke}")
        for uid, email in smoke_rows:
            print(f"  - id={uid} email={email}")
        print("Admins kept:")
        for uid, email in admins:
            print(f"  - id={uid} email={email}")

        if before_smoke == 0:
            print("\nNo smoke users to delete.")
            conn.commit()
            return 0

        print("\n=== EXECUTING SQL (transaction) ===")
        cur.execute("START TRANSACTION")
        deleted_per_step = []
        for label, sql in DELETE_STEPS:
            cur.execute(sql)
            deleted_per_step.append((label, cur.rowcount))
            print(f"{label}: {cur.rowcount} row(s) affected")

        conn.commit()
        print("Transaction committed.")

        cur.execute("DROP FUNCTION IF EXISTS is_smoke_test_user_email")
        cur.execute(CREATE_FUNCTION_SQL.strip())

        after_total = count_users(cur)
        after_smoke = count_smoke_users(cur)

        print("\n=== AFTER ===")
        print(f"Total users: {after_total}")
        print(f"Smoke/test users remaining: {after_smoke}")
        print(f"Users removed: {before_total - after_total}")

        if after_smoke != 0:
            print("ERROR: smoke users still present", file=sys.stderr)
            return 1

        print("\nCleanup committed successfully.")
        return 0
    except Exception as exc:
        conn.rollback()
        print(f"FAILED (rolled back): {exc}", file=sys.stderr)
        raise
    finally:
        conn.close()


if __name__ == "__main__":
    sys.exit(main())
