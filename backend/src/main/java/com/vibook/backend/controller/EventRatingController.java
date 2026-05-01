package com.vibook.backend.controller;

import com.vibook.backend.dto.BusinessEventResponse;
import com.vibook.backend.dto.BusinessEventSummaryResponse;
import com.vibook.backend.dto.EventRatingRequest;
import com.vibook.backend.dto.EventRatingResponse;
import com.vibook.backend.entity.RoleName;
import com.vibook.backend.exception.UnauthorizedException;
import com.vibook.backend.security.AuthenticatedUser;
import com.vibook.backend.service.ConsumerEventService;
import com.vibook.backend.service.EventRatingService;
import jakarta.validation.Valid;
import java.math.BigDecimal;
import java.time.LocalDate;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/events")
public class EventRatingController {

    private final EventRatingService eventRatingService;
    private final ConsumerEventService consumerEventService;

    public EventRatingController(EventRatingService eventRatingService, ConsumerEventService consumerEventService) {
        this.eventRatingService = eventRatingService;
        this.consumerEventService = consumerEventService;
    }

    @GetMapping
    public ResponseEntity<Page<BusinessEventSummaryResponse>> listEvents(
        @AuthenticationPrincipal AuthenticatedUser principal,
        @RequestParam(required = false) Long governorateId,
        @RequestParam(required = false) Long categoryId,
        @RequestParam(required = false) Long subcategoryId,
        @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date,
        @RequestParam(required = false) String keyword,
        @RequestParam(required = false) BigDecimal minPrice,
        @RequestParam(required = false) BigDecimal maxPrice,
        @RequestParam(required = false, defaultValue = "false") boolean includeHidden,
        @PageableDefault(size = 20) Pageable pageable
    ) {
        requirePrincipal(principal);
        boolean admin = principal.getAuthorities().stream().anyMatch(a -> a.getAuthority().equals(RoleName.ROLE_ADMIN.name()));
        boolean includeHiddenSafe = includeHidden && admin;
        return ResponseEntity.ok(
            consumerEventService.searchEvents(
                governorateId,
                categoryId,
                subcategoryId,
                date,
                keyword,
                minPrice,
                maxPrice,
                includeHiddenSafe,
                admin,
                pageable
            )
        );
    }

    @GetMapping("/{eventId}")
    public ResponseEntity<BusinessEventResponse> getEventForViewer(
        @AuthenticationPrincipal AuthenticatedUser principal,
        @PathVariable Long eventId
    ) {
        requirePrincipal(principal);
        return ResponseEntity.ok(eventRatingService.getEventForViewer(eventId, principal.getUsername()));
    }

    @PostMapping("/{eventId}/rate")
    public ResponseEntity<EventRatingResponse> rateEvent(
        @AuthenticationPrincipal AuthenticatedUser principal,
        @PathVariable Long eventId,
        @Valid @RequestBody EventRatingRequest request
    ) {
        requirePrincipal(principal);
        EventRatingResponse body = eventRatingService.rateEvent(eventId, request.rating(), principal.getUsername());
        return ResponseEntity.ok(body);
    }

    private static void requirePrincipal(AuthenticatedUser principal) {
        if (principal == null) {
            throw new UnauthorizedException("Unauthorized");
        }
    }
}
