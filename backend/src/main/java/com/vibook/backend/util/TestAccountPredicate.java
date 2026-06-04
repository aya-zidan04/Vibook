package com.vibook.backend.util;

import com.vibook.backend.entity.User;
import java.util.Locale;

/**
 * Identifies smoke, E2E, and placeholder accounts for one-time DB cleanup scripts.
 * Does not match general {@code @test.com} dev mailboxes — only {@code @vibook.test}, smoke/biz
 * automation prefixes, {@code @example.*}, {@code demo@*}, and {@code +test} aliases.
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
        int at = normalized.indexOf('@');
        String localPart = at > 0 ? normalized.substring(0, at) : normalized;
        String domain = at > 0 ? normalized.substring(at + 1) : "";

        // Smoke / E2E mailbox domain used in automated runs.
        if ("vibook.test".equals(domain)) {
            return true;
        }
        if (normalized.startsWith("smoke_") || localPart.startsWith("smoke")) {
            return true;
        }
        if (localPart.startsWith("biz_") && ("vibook.test".equals(domain) || domain.endsWith(".test"))) {
            return true;
        }
        if (normalized.contains("+test")) {
            return true;
        }
        if (normalized.contains("@example.")) {
            return true;
        }
        if (normalized.startsWith("demo@")) {
            return true;
        }
        return false;
    }
}
