package com.vibook.web.controller;

import com.vibook.security.SecurityUserPrincipal;
import com.vibook.service.MembershipService;
import com.vibook.web.dto.membership.MeMembershipResponse;
import com.vibook.web.dto.membership.SubscribeMembershipRequest;
import jakarta.validation.Valid;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/me/membership")
public class MeMembershipController {

    private final MembershipService membershipService;

    public MeMembershipController(MembershipService membershipService) {
        this.membershipService = membershipService;
    }

    @GetMapping
    public MeMembershipResponse getMembership(@AuthenticationPrincipal SecurityUserPrincipal principal) {
        return membershipService.getMembership(principal.getId());
    }

    @PostMapping("/subscribe")
    public MeMembershipResponse subscribe(
            @AuthenticationPrincipal SecurityUserPrincipal principal,
            @Valid @RequestBody SubscribeMembershipRequest request
    ) {
        return membershipService.subscribe(principal.getId(), request);
    }
}
