package com.vibook.web.dto.membership;

import com.vibook.entity.MembershipPlan;
import com.vibook.entity.enums.MembershipTier;

import java.math.BigDecimal;
import java.util.List;

public record MembershipPlanResponse(
        long id,
        String code,
        MembershipTier tier,
        String nameEn,
        String nameAr,
        BigDecimal priceMonthly,
        String currency,
        boolean recommended,
        List<String> benefits
) {
    public static MembershipPlanResponse fromEntity(MembershipPlan p) {
        return new MembershipPlanResponse(
                p.getId(),
                p.getCode(),
                p.getTier(),
                p.getNameEn(),
                p.getNameAr(),
                p.getPriceMonthly(),
                p.getCurrency().name(),
                p.isRecommended(),
                List.copyOf(p.getBenefits())
        );
    }
}
