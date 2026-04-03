package com.vibook.web.dto.user;

import com.vibook.entity.User;
import com.vibook.entity.enums.MembershipTier;
import com.vibook.entity.enums.PreferredLanguage;

import java.math.BigDecimal;
import java.util.UUID;

/**
 * Shared profile shape for auth and /me. {@link #fullName()} is {@code firstName + " " + lastName} for mobile clients
 * that use a single display name alongside structured fields.
 */
public record UserResponse(
        UUID id,
        String email,
        String firstName,
        String lastName,
        String fullName,
        String nameAr,
        String phone,
        PreferredLanguage preferredLanguage,
        String avatarUrl,
        MembershipTier membershipTier,
        BigDecimal walletBalance,
        String walletCurrency,
        Long cityId
) {
    public static UserResponse fromEntity(User u) {
        String fullName = (u.getFirstName() + " " + u.getLastName()).trim();
        return new UserResponse(
                u.getId(),
                u.getEmail(),
                u.getFirstName(),
                u.getLastName(),
                fullName,
                u.getNameAr(),
                u.getPhone(),
                u.getPreferredLanguage(),
                u.getAvatarUrl(),
                u.getMembershipTier(),
                u.getWalletBalance(),
                u.getWalletCurrency().name(),
                u.getCityId()
        );
    }
}
