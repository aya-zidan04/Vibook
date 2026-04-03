package com.vibook.web.dto.voucher;

import com.vibook.entity.UserVoucher;

import java.math.BigDecimal;
import java.time.Instant;

public record VoucherResponse(
        String id,
        String code,
        String title,
        String titleAr,
        String discountType,
        BigDecimal discountValue,
        Instant expiresAt,
        boolean redeemed
) {
    public static VoucherResponse fromEntity(UserVoucher uv) {
        var c = uv.getCampaign();
        return new VoucherResponse(
                uv.getId().toString(),
                c.getCode(),
                c.getTitle(),
                c.getTitleAr(),
                c.getDiscountType().getApiKey(),
                c.getDiscountValue(),
                c.getExpiresAt(),
                uv.getAppliedAt() != null
        );
    }
}
