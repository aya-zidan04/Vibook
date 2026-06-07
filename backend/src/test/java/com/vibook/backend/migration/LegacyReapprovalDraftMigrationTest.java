package com.vibook.backend.migration;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.vibook.backend.entity.BusinessProfile;
import com.vibook.backend.entity.BusinessProfileStatus;
import com.vibook.backend.repository.BusinessProfileRepository;
import java.time.Instant;
import java.util.List;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class LegacyReapprovalDraftMigrationTest {

    @Mock
    private BusinessProfileRepository businessProfileRepository;

    @InjectMocks
    private LegacyReapprovalDraftMigration migration;

    @Test
    void migrate_movesLegacyReapprovalDraftsToPendingReview() {
        BusinessProfile legacy = legacyDraftProfile();
        when(businessProfileRepository.findLegacyReapprovalDraftSubmissions(BusinessProfileStatus.DRAFT))
            .thenReturn(List.of(legacy));
        when(businessProfileRepository.saveAll(any())).thenAnswer(inv -> inv.getArgument(0));

        int count = migration.migrate();

        assertThat(count).isEqualTo(1);
        ArgumentCaptor<List<BusinessProfile>> captor = ArgumentCaptor.forClass(List.class);
        verify(businessProfileRepository).saveAll(captor.capture());
        BusinessProfile saved = captor.getValue().getFirst();
        assertThat(saved.getStatus()).isEqualTo(BusinessProfileStatus.PENDING_REVIEW);
        assertThat(saved.isRequiresReApproval()).isTrue();
        assertThat(saved.isPreviouslyApproved()).isTrue();
    }

    @Test
    void migrate_returnsZeroWhenNoLegacyRows() {
        when(businessProfileRepository.findLegacyReapprovalDraftSubmissions(eq(BusinessProfileStatus.DRAFT)))
            .thenReturn(List.of());

        assertThat(migration.migrate()).isZero();
    }

    private static BusinessProfile legacyDraftProfile() {
        BusinessProfile profile = new BusinessProfile();
        profile.setId(42L);
        profile.setStatus(BusinessProfileStatus.DRAFT);
        profile.setRequiresReApproval(true);
        profile.setPreviouslyApproved(true);
        profile.setApprovedAt(Instant.parse("2025-06-01T12:00:00Z"));
        return profile;
    }
}
