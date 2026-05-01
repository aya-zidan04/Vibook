package com.vibook.backend.service.impl;

import com.vibook.backend.dto.AdminAnalyticsSummaryResponse;
import com.vibook.backend.dto.NameCountResponse;
import com.vibook.backend.dto.TimeSeriesPointResponse;
import com.vibook.backend.entity.Booking;
import com.vibook.backend.entity.BusinessProfile;
import com.vibook.backend.entity.BusinessProfileStatus;
import com.vibook.backend.entity.User;
import com.vibook.backend.repository.BookingRepository;
import com.vibook.backend.repository.BusinessProfileRepository;
import com.vibook.backend.repository.UserRepository;
import com.vibook.backend.service.AdminAnalyticsService;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneOffset;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AdminAnalyticsServiceImpl implements AdminAnalyticsService {

    private static final int CHART_DAYS = 30;

    private final UserRepository userRepository;
    private final BusinessProfileRepository businessProfileRepository;
    private final BookingRepository bookingRepository;

    public AdminAnalyticsServiceImpl(
        UserRepository userRepository,
        BusinessProfileRepository businessProfileRepository,
        BookingRepository bookingRepository
    ) {
        this.userRepository = userRepository;
        this.businessProfileRepository = businessProfileRepository;
        this.bookingRepository = bookingRepository;
    }

    @Override
    @Transactional(readOnly = true)
    public AdminAnalyticsSummaryResponse getSummary() {
        long totalUsers = userRepository.count();
        long activeUsers = userRepository.countByEnabledTrue();
        long totalBusinessProfiles = businessProfileRepository.count();
        long pending = businessProfileRepository.countByStatus(BusinessProfileStatus.PENDING_REVIEW);
        long approved = businessProfileRepository.countByStatus(BusinessProfileStatus.APPROVED);
        long rejected = businessProfileRepository.countByStatus(BusinessProfileStatus.REJECTED);
        long draft = businessProfileRepository.countByStatus(BusinessProfileStatus.DRAFT);

        long decided = approved + rejected;
        double approvalRate = decided == 0 ? 0.0 : (approved * 100.0) / decided;
        double rejectionRate = decided == 0 ? 0.0 : (rejected * 100.0) / decided;

        Instant from = Instant.now().minus(CHART_DAYS, ChronoUnit.DAYS);
        List<TimeSeriesPointResponse> usersSeries = buildDailySeries(userRepository.findByCreatedAtGreaterThanEqual(from));
        List<TimeSeriesPointResponse> bizSeries = buildDailySeriesForProfiles(
            businessProfileRepository.findByCreatedAtGreaterThanEqual(from)
        );
        List<TimeSeriesPointResponse> bookingsSeries = buildDailySeriesForBookings(
            bookingRepository.findByCreatedAtGreaterThanEqual(from)
        );

        List<NameCountResponse> byStatus = List.of(
            new NameCountResponse("APPROVED", approved),
            new NameCountResponse("PENDING_REVIEW", pending),
            new NameCountResponse("REJECTED", rejected),
            new NameCountResponse("DRAFT", draft)
        );

        List<NameCountResponse> topCategories = mapNameCountRows(businessProfileRepository.countGroupedByCategoryName());
        List<NameCountResponse> topGovernorates = mapNameCountRows(businessProfileRepository.countGroupedByGovernorateName());

        return new AdminAnalyticsSummaryResponse(
            totalUsers,
            activeUsers,
            totalBusinessProfiles,
            pending,
            approved,
            rejected,
            draft,
            round1(approvalRate),
            round1(rejectionRate),
            usersSeries,
            bizSeries,
            bookingsSeries,
            byStatus,
            topCategories,
            topGovernorates,
            true
        );
    }

    private static List<NameCountResponse> mapNameCountRows(List<Object[]> rows) {
        if (rows == null || rows.isEmpty()) {
            return List.of();
        }
        return rows
            .stream()
            .map(row -> {
                String name = row[0] != null ? String.valueOf(row[0]).trim() : "";
                if (name.isEmpty()) {
                    name = "Unknown";
                }
                return new NameCountResponse(name, toLong(row.length > 1 ? row[1] : null));
            })
            .sorted(Comparator.comparingLong(NameCountResponse::count).reversed())
            .limit(8)
            .toList();
    }

    private static long toLong(Object n) {
        if (n == null) {
            return 0L;
        }
        if (n instanceof Number num) {
            return num.longValue();
        }
        return 0L;
    }

    private static List<TimeSeriesPointResponse> buildDailySeries(List<User> users) {
        Map<String, Long> counts = new LinkedHashMap<>();
        if (users != null) {
            for (User u : users) {
                if (u.getCreatedAt() == null) {
                    continue;
                }
                String day = LocalDate.ofInstant(u.getCreatedAt(), ZoneOffset.UTC).toString();
                counts.merge(day, 1L, Long::sum);
            }
        }
        return fillSeries(counts);
    }

    private static List<TimeSeriesPointResponse> buildDailySeriesForProfiles(List<BusinessProfile> profiles) {
        Map<String, Long> counts = new LinkedHashMap<>();
        if (profiles != null) {
            for (BusinessProfile b : profiles) {
                if (b.getCreatedAt() == null) {
                    continue;
                }
                String day = LocalDate.ofInstant(b.getCreatedAt(), ZoneOffset.UTC).toString();
                counts.merge(day, 1L, Long::sum);
            }
        }
        return fillSeries(counts);
    }

    private static List<TimeSeriesPointResponse> buildDailySeriesForBookings(List<Booking> bookings) {
        Map<String, Long> counts = new LinkedHashMap<>();
        if (bookings != null) {
            for (Booking b : bookings) {
                if (b.getCreatedAt() == null) {
                    continue;
                }
                String day = LocalDate.ofInstant(b.getCreatedAt(), ZoneOffset.UTC).toString();
                counts.merge(day, 1L, Long::sum);
            }
        }
        return fillSeries(counts);
    }

    private static List<TimeSeriesPointResponse> fillSeries(Map<String, Long> counts) {
        LocalDate end = LocalDate.now(ZoneOffset.UTC);
        LocalDate start = end.minusDays(CHART_DAYS - 1L);
        List<TimeSeriesPointResponse> out = new ArrayList<>();
        for (LocalDate d = start; !d.isAfter(end); d = d.plusDays(1)) {
            String key = d.toString();
            out.add(new TimeSeriesPointResponse(key, counts.getOrDefault(key, 0L)));
        }
        return out;
    }

    private static double round1(double v) {
        return Math.round(v * 10.0) / 10.0;
    }
}
