package com.vibook.backend.dto;

import java.util.List;

public record AdminAnalyticsSummaryResponse(
    long totalUsers,
    long activeUsers,
    long totalBusinessProfiles,
    long pendingBusinessProfiles,
    long approvedBusinessProfiles,
    long rejectedBusinessProfiles,
    long draftBusinessProfiles,
    double approvalRatePercent,
    double rejectionRatePercent,
    List<TimeSeriesPointResponse> newUsersByDay,
    List<TimeSeriesPointResponse> newBusinessProfilesByDay,
    List<TimeSeriesPointResponse> newBookingsByDay,
    List<NameCountResponse> businessProfilesByStatus,
    List<NameCountResponse> topCategories,
    List<NameCountResponse> topGovernorates,
    boolean bookingsTrendAvailable
) {
}
