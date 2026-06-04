package com.vibook.backend.util;

import com.vibook.backend.entity.User;
import java.util.Locale;

/**
 * Identifies smoke, E2E, and placeholder accounts that should not appear in the admin user list.
 * Real users remain in the database; only {@code getAllUsers} filters them out.
 */
public final class TestAccountPredicate {

    private TestAccountPredicate() {}

    public static boolean isTestAccount(User user) {
        if (user == null) {
            return false;
        }
        String email = user.getEmail();
        if (email == null || email.isBlank()) {
            return false;
        }
        String normalized = email.trim().toLowerCase(Locale.ROOT);
        if (normalized.startsWith("smoke_")) {
            return true;
        }
        if (normalized.contains("+test")) {
            return true;
        }
        if (normalized.contains("@test.")) {
            return true;
        }
        if (normalized.contains("@example.")) {
            return true;
        }
        if (normalized.startsWith("demo@")) {
            return true;
        }
        int at = normalized.indexOf('@');
        if (at > 0) {
            String localPart = normalized.substring(0, at);
            if (localPart.startsWith("smoke_")) {
                return true;
            }
        }
        return false;
    }
}
