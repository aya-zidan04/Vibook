package com.vibook.backend.controller;

import com.vibook.backend.dto.GovernorateAdminStatsResponse;
import com.vibook.backend.exception.UnauthorizedException;
import com.vibook.backend.repository.GovernorateRepository;
import com.vibook.backend.security.AuthenticatedUser;
import java.util.List;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/admin/governorates")
public class AdminGovernorateStatsController {

    private final GovernorateRepository governorateRepository;

    public AdminGovernorateStatsController(GovernorateRepository governorateRepository) {
        this.governorateRepository = governorateRepository;
    }

    @GetMapping("/stats")
    public ResponseEntity<List<GovernorateAdminStatsResponse>> stats(
        @AuthenticationPrincipal AuthenticatedUser principal
    ) {
        if (principal == null) {
            throw new UnauthorizedException("Unauthorized");
        }
        List<GovernorateAdminStatsResponse> rows = governorateRepository
            .summarizeWithBusinessCounts()
            .stream()
            .map(AdminGovernorateStatsController::mapRow)
            .toList();
        return ResponseEntity.ok(rows);
    }

    private static GovernorateAdminStatsResponse mapRow(Object[] row) {
        Long id = (Long) row[0];
        String name = (String) row[1];
        Integer displayOrder = (Integer) row[2];
        Boolean active = (Boolean) row[3];
        long count = row[4] instanceof Long l ? l : ((Number) row[4]).longValue();
        return new GovernorateAdminStatsResponse(id, name, displayOrder, active, count);
    }
}
