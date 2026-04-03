package com.vibook.web.dto.membership;

import com.vibook.entity.MembershipPlan;
import com.vibook.entity.User;
import com.vibook.entity.enums.MembershipSubscriptionStatus;
import com.vibook.entity.enums.MembershipTier;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;

public record MeMembershipResponse(
        MembershipTier membershipTier,
        MembershipSubscriptionStatus subscriptionStatus,
        Long planId,
        String planCode,
        String planNameEn,
        String planNameAr,
        BigDecimal planPriceMonthly,
        String planCurrency,
        Boolean planRecommended,
        List<String> planBenefits,
        Instant subscribedAt,
        Instant renewsAt,
        String paymentReference
) {
    public static MeMembershipResponse fromUser(User u) {
        MembershipPlan p = u.getMembershipPlan();
        if (p == null) {
            return new MeMembershipResponse(
                    u.getMembershipTier(),
                    u.getMembershipSubscriptionStatus(),
                    null, null, null, null, null, null, null, null,
                    u.getMembershipSubscribedAt(),
                    u.getMembershipRenewsAt(),
                    u.getMembershipPaymentReference()
            );
        }
        return new MeMembershipResponse(
                u.getMembershipTier(),
                u.getMembershipSubscriptionStatus(),
                p.getId(),
                p.getCode(),
                p.getNameEn(),
                p.getNameAr(),
                p.getPriceMonthly(),
                p.getCurrency().name(),
                p.isRecommended(),
                List.copyOf(p.getBenefits()),
                u.getMembershipSubscribedAt(),
                u.getMembershipRenewsAt(),
                u.getMembershipPaymentReference()
        );
    }
}
