package com.vibook.service;

import com.vibook.entity.MembershipPlan;
import com.vibook.entity.User;
import com.vibook.entity.enums.MembershipSubscriptionStatus;
import com.vibook.repository.MembershipPlanRepository;
import com.vibook.repository.UserRepository;
import com.vibook.web.dto.membership.MeMembershipResponse;
import com.vibook.web.dto.membership.MembershipPlanResponse;
import com.vibook.web.dto.membership.MembershipPlansListResponse;
import com.vibook.web.dto.membership.SubscribeMembershipRequest;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.UUID;

/**
 * Plans live in {@code membership_plans} (seeded + future admin edits). Keeps pricing/benefits out of code.
 */
@Service
public class MembershipService {

    private final MembershipPlanRepository membershipPlanRepository;
    private final UserRepository userRepository;

    public MembershipService(MembershipPlanRepository membershipPlanRepository, UserRepository userRepository) {
        this.membershipPlanRepository = membershipPlanRepository;
        this.userRepository = userRepository;
    }

    @Transactional(readOnly = true)
    public MembershipPlansListResponse listPlans() {
        var plans = membershipPlanRepository.findByActiveTrueOrderBySortIndexAsc().stream()
                .map(MembershipPlanResponse::fromEntity)
                .toList();
        return new MembershipPlansListResponse(plans);
    }

    @Transactional(readOnly = true)
    public MeMembershipResponse getMembership(UUID userId) {
        User user = userRepository.findByIdWithMembershipPlan(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
        return MeMembershipResponse.fromUser(user);
    }

    @Transactional
    public MeMembershipResponse subscribe(UUID userId, SubscribeMembershipRequest request) {
        MembershipPlan plan = membershipPlanRepository.findByIdAndActiveTrue(request.planId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Membership plan not found"));
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));

        Instant now = Instant.now();
        user.setMembershipPlan(plan);
        user.setMembershipTier(plan.getTier());
        user.setMembershipSubscriptionStatus(MembershipSubscriptionStatus.ACTIVE);
        user.setMembershipSubscribedAt(now);
        user.setMembershipRenewsAt(now.plus(30, ChronoUnit.DAYS));
        if (request.paymentReference() != null && !request.paymentReference().isBlank()) {
            user.setMembershipPaymentReference(request.paymentReference().trim());
        } else {
            user.setMembershipPaymentReference(null);
        }

        return MeMembershipResponse.fromUser(userRepository.save(user));
    }
}
