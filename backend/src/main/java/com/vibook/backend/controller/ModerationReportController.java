package com.vibook.backend.controller;

import com.vibook.backend.dto.CreateModerationReportRequest;
import com.vibook.backend.dto.ModerationReportCreatedResponse;
import com.vibook.backend.exception.UnauthorizedException;
import com.vibook.backend.security.AuthenticatedUser;
import com.vibook.backend.service.ModerationReportSubmissionService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/reports")
public class ModerationReportController {

    private final ModerationReportSubmissionService moderationReportSubmissionService;

    public ModerationReportController(ModerationReportSubmissionService moderationReportSubmissionService) {
        this.moderationReportSubmissionService = moderationReportSubmissionService;
    }

    @PostMapping
    public ResponseEntity<ModerationReportCreatedResponse> create(
        @AuthenticationPrincipal AuthenticatedUser principal,
        @Valid @RequestBody CreateModerationReportRequest request
    ) {
        if (principal == null) {
            throw new UnauthorizedException("Unauthorized");
        }
        ModerationReportCreatedResponse body = moderationReportSubmissionService.submit(principal, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(body);
    }
}
