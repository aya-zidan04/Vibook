package com.vibook.web.dto.wallet;

import com.vibook.entity.User;

import java.math.BigDecimal;

public record WalletResponse(
        BigDecimal balance,
        String currency
) {
    public static WalletResponse fromUser(User user) {
        return new WalletResponse(user.getWalletBalance(), user.getWalletCurrency().name());
    }
}
