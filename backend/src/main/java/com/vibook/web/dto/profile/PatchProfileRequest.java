package com.vibook.web.dto.profile;

import com.vibook.entity.enums.PreferredLanguage;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

/**
 * Partial update: only non-null fields are applied. Use {@code unsetCity == true} to clear home city
 * (JSON null for {@code cityId} alone cannot be distinguished from "omit" with a simple record).
 */
public record PatchProfileRequest(
        @Size(max = 100, message = "firstName must be at most 100 characters")
        String firstName,

        @Size(max = 100, message = "lastName must be at most 100 characters")
        String lastName,

        @Size(max = 200, message = "nameAr must be at most 200 characters")
        String nameAr,

        @Pattern(regexp = "^[+\\d][\\d\\s\\-]{7,24}$", message = "phone must be a valid international or local number")
        String phone,

        PreferredLanguage preferredLanguage,

        Long cityId,

        Boolean unsetCity,

        @Size(max = 1024, message = "avatarUrl must be at most 1024 characters")
        String avatarUrl
) {
}
