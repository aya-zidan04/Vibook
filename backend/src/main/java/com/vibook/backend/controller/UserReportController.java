package com.vibook.backend.controller;

import com.vibook.backend.dto.CreateUserReportRequest;
import com.vibook.backend.dto.UserReportCreatedResponse;
import com.vibook.backend.exception.UnauthorizedException;
import com.vibook.backend.security.AuthenticatedUser;
import com.vibook.backend.service.UserReportSubmissionService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/user-reports")
public class UserReportController {

    private final UserReportSubmissionService userReportSubmissionService;

    public UserReportController(UserReportSubmissionService userReportSubmissionService) {
        this.userReportSubmissionService = userReportSubmissionService;
    }

    @PostMapping
    public ResponseEntity<UserReportCreatedResponse> create(
        @AuthenticationPrincipal AuthenticatedUser principal,
        @Valid @RequestBody CreateUserReportRequest request
    ) {
        if (principal == null) {
            throw new UnauthorizedException("Unauthorized");
        }
        UserReportCreatedResponse body = userReportSubmissionService.submit(principal, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(body);
    }
}
