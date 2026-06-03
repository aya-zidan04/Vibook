package com.vibook.backend.service;

import com.vibook.backend.entity.User;

/** Grants or revokes {@code ROLE_BUSINESS} on the user account tied to business profile lifecycle. */
public interface BusinessUserRoleService {

    void grantBusinessRole(User user);

    void revokeBusinessRole(User user);
}
