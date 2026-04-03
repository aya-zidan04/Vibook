package com.vibook.web.dto.voucher;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record RedeemVoucherRequest(
        @NotBlank @Size(max = 64) String code
) {
}
