package com.vibook.backend.util;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

import com.vibook.backend.entity.User;
import org.junit.jupiter.api.Test;

class TestAccountPredicateTest {

    @Test
    void detectsSmokeAndPlaceholderEmails() {
        assertTrue(TestAccountPredicate.isTestAccount(userWithEmail("smoke_runner@test.vibook")));
        assertTrue(TestAccountPredicate.isTestAccount(userWithEmail("user+test@company.com")));
        assertTrue(TestAccountPredicate.isTestAccount(userWithEmail("qa@test.vibook")));
        assertTrue(TestAccountPredicate.isTestAccount(userWithEmail("guest@example.com")));
        assertTrue(TestAccountPredicate.isTestAccount(userWithEmail("demo@partner.io")));
        assertTrue(TestAccountPredicate.isTestAccount(userWithEmail("smoke_admin@vibook.com")));
    }

    @Test
    void keepsRealUserEmails() {
        assertFalse(TestAccountPredicate.isTestAccount(userWithEmail("ayaz@company.com")));
        assertFalse(TestAccountPredicate.isTestAccount(userWithEmail("partner@restaurant.jo")));
        assertFalse(TestAccountPredicate.isTestAccount(null));
    }

    private static User userWithEmail(String email) {
        User user = new User();
        user.setEmail(email);
        return user;
    }
}
