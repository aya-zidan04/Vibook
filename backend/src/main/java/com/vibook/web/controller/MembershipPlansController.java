package com.vibook.web.controller;

import com.vibook.service.MembershipService;
import com.vibook.web.dto.membership.MembershipPlansListResponse;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/membership")
public class MembershipPlansController {

    private final MembershipService membershipService;

    public MembershipPlansController(MembershipService membershipService) {
        this.membershipService = membershipService;
    }

    @GetMapping("/plans")
    public MembershipPlansListResponse listPlans() {
        return membershipService.listPlans();
    }
}
