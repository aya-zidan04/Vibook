package com.vibook.backend.entity;

import static org.junit.jupiter.api.Assertions.assertEquals;

import org.junit.jupiter.api.Test;

class RoleNameTest {

    @Test
    void authorityMatchesEnumName() {
        assertEquals("ROLE_USER", RoleName.ROLE_USER.authority());
        assertEquals("ROLE_BUSINESS", RoleName.ROLE_BUSINESS.authority());
        assertEquals("ROLE_ADMIN", RoleName.ROLE_ADMIN.authority());
    }
}
