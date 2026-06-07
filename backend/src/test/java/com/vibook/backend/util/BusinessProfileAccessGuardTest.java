package com.vibook.backend.util;

import static org.assertj.core.api.Assertions.assertThatThrownBy;

import com.vibook.backend.entity.BusinessProfile;
import com.vibook.backend.entity.BusinessProfileStatus;
import com.vibook.backend.exception.ForbiddenException;
import org.junit.jupiter.api.Test;

class BusinessProfileAccessGuardTest {

    @Test
    void requireApprovedForManagement_rejectsDraftProfile() {
        BusinessProfile profile = new BusinessProfile();
        profile.setStatus(BusinessProfileStatus.DRAFT);

        assertThatThrownBy(() -> BusinessProfileAccessGuard.requireApprovedForManagement(profile))
            .isInstanceOf(ForbiddenException.class)
            .hasMessageContaining("only after admin approval");
    }

    @Test
    void requireApprovedForManagement_rejectsPendingReviewProfile() {
        BusinessProfile profile = new BusinessProfile();
        profile.setStatus(BusinessProfileStatus.PENDING_REVIEW);
        profile.setRequiresReApproval(true);
        profile.setPreviouslyApproved(true);

        assertThatThrownBy(() -> BusinessProfileAccessGuard.requireApprovedForManagement(profile))
            .isInstanceOf(ForbiddenException.class)
            .hasMessageContaining("only after admin approval");
    }

    @Test
    void requireApprovedForManagement_allowsApprovedProfile() {
        BusinessProfile profile = new BusinessProfile();
        profile.setStatus(BusinessProfileStatus.APPROVED);

        BusinessProfileAccessGuard.requireApprovedForManagement(profile);
    }
}
