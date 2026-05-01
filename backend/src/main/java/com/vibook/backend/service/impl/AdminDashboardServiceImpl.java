package com.vibook.backend.service.impl;

import com.vibook.backend.dto.AdminDashboardStatsResponse;
import com.vibook.backend.entity.BusinessProfileStatus;
import com.vibook.backend.repository.BusinessProfileRepository;
import com.vibook.backend.repository.UserRepository;
import com.vibook.backend.service.AdminDashboardService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AdminDashboardServiceImpl implements AdminDashboardService {

    private final UserRepository userRepository;
    private final BusinessProfileRepository businessProfileRepository;

    public AdminDashboardServiceImpl(
        UserRepository userRepository,
        BusinessProfileRepository businessProfileRepository
    ) {
        this.userRepository = userRepository;
        this.businessProfileRepository = businessProfileRepository;
    }

    @Override
    @Transactional(readOnly = true)
    public AdminDashboardStatsResponse getStats() {
        long totalUsers = userRepository.count();
        long totalBusinessProfiles = businessProfileRepository.count();
        long pendingBusinessProfiles = businessProfileRepository.countByStatus(BusinessProfileStatus.PENDING_REVIEW);
        long approvedBusinessProfiles = businessProfileRepository.countByStatus(BusinessProfileStatus.APPROVED);
        return new AdminDashboardStatsResponse(
            totalUsers,
            totalBusinessProfiles,
            pendingBusinessProfiles,
            approvedBusinessProfiles
        );
    }
}
