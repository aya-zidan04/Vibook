package com.vibook.web.controller;

import com.vibook.security.SecurityUserPrincipal;
import com.vibook.service.WalletService;
import com.vibook.web.dto.wallet.WalletResponse;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/me/wallet")
public class MeWalletController {

    private final WalletService walletService;

    public MeWalletController(WalletService walletService) {
        this.walletService = walletService;
    }

    @GetMapping
    public WalletResponse getWallet(@AuthenticationPrincipal SecurityUserPrincipal principal) {
        return walletService.getWallet(principal.getId());
    }
}
