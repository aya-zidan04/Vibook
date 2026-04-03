package com.vibook.web.controller;

import com.vibook.security.SecurityUserPrincipal;
import com.vibook.service.VoucherService;
import com.vibook.web.dto.voucher.RedeemVoucherRequest;
import com.vibook.web.dto.voucher.VoucherResponse;
import com.vibook.web.dto.voucher.VouchersListResponse;
import jakarta.validation.Valid;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/me/vouchers")
public class MeVouchersController {

    private final VoucherService voucherService;

    public MeVouchersController(VoucherService voucherService) {
        this.voucherService = voucherService;
    }

    @GetMapping
    public VouchersListResponse listVouchers(@AuthenticationPrincipal SecurityUserPrincipal principal) {
        return voucherService.listVouchers(principal.getId());
    }

    @PostMapping("/redeem")
    public VoucherResponse redeem(
            @AuthenticationPrincipal SecurityUserPrincipal principal,
            @Valid @RequestBody RedeemVoucherRequest request
    ) {
        return voucherService.redeem(principal.getId(), request);
    }
}
