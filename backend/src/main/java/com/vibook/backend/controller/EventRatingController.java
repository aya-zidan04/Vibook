package com.vibook.backend.controller;

import com.vibook.backend.dto.BusinessEventResponse;
import com.vibook.backend.dto.EventRatingRequest;
import com.vibook.backend.dto.EventRatingResponse;
import com.vibook.backend.exception.UnauthorizedException;
import com.vibook.backend.security.AuthenticatedUser;
import com.vibook.backend.service.EventRatingService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/events")
public class EventRatingController {

    private final EventRatingService eventRatingService;

    public EventRatingController(EventRatingService eventRatingService) {
        this.eventRatingService = eventRatingService;
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
