package com.vibook.backend.util;

import com.vibook.backend.entity.BusinessProfile;
import com.vibook.backend.entity.BusinessProfileStatus;
import com.vibook.backend.exception.ForbiddenException;

public final class BusinessProfileAccessGuard {

    private BusinessProfileAccessGuard() {}

    public static void requireApprovedForManagement(BusinessProfile profile) {
        if (profile.getStatus() != BusinessProfileStatus.APPROVED) {
            throw new ForbiddenException("Business management is available only after admin approval");
        }
    }
}
