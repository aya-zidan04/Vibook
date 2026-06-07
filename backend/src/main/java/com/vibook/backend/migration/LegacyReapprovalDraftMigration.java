package com.vibook.backend.migration;

import com.vibook.backend.entity.BusinessProfile;
import com.vibook.backend.entity.BusinessProfileStatus;
import com.vibook.backend.repository.BusinessProfileRepository;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * One-time (idempotent) fix for profiles stuck in {@code DRAFT} under the old re-approval flow.
 * Targets only returning partners: {@code requiresReApproval=true} and evidence of prior approval.
 */
@Service
public class LegacyReapprovalDraftMigration {

    private final BusinessProfileRepository businessProfileRepository;

    public LegacyReapprovalDraftMigration(BusinessProfileRepository businessProfileRepository) {
        this.businessProfileRepository = businessProfileRepository;
    }

    @Transactional
    public int migrate() {
        List<BusinessProfile> legacy = businessProfileRepository.findLegacyReapprovalDraftSubmissions(
            BusinessProfileStatus.DRAFT
        );
        for (BusinessProfile profile : legacy) {
            profile.setStatus(BusinessProfileStatus.PENDING_REVIEW);
        }
        businessProfileRepository.saveAll(legacy);
        return legacy.size();
    }
}
