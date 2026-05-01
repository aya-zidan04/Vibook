package com.vibook.backend.dto;

public record AdminDashboardStatsResponse(
    long totalUsers,
    long totalBusinessProfiles,
    long pendingBusinessProfiles,
    long approvedBusinessProfiles
) {
}
