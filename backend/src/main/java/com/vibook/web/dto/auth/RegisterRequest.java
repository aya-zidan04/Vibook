package com.vibook.web.dto.auth;

import com.vibook.entity.enums.PreferredLanguage;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record RegisterRequest(
        @Email(message = "Must be a valid email")
        @NotBlank
        @Size(max = 255)
        String email,

        @NotBlank
        @Size(min = 8, max = 128)
        String password,

        @NotBlank
        @Size(max = 100)
        String firstName,

        @NotBlank
        @Size(max = 100)
        String lastName,

        @NotBlank
        @Size(max = 32)
        @Pattern(regexp = "^[+\\d][\\d\\s\\-]{7,24}$", message = "Phone must be a valid international or local number")
        String phone,

        /**
         * Optional; defaults to {@link PreferredLanguage#EN} when omitted (matches mobile default).
         */
        PreferredLanguage preferredLanguage
) {
}
