package com.vibook.backend.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record RegisterRequest(
    @NotBlank(message = "First name is required")
    @Size(max = 80, message = "First name must not exceed 80 characters")
    String firstName,

    @NotBlank(message = "Last name is required")
    @Size(max = 80, message = "Last name must not exceed 80 characters")
    String lastName,

    @NotBlank(message = "Email is required")
    @Email(message = "Email must be valid")
    @Size(max = 120, message = "Email must not exceed 120 characters")
    String email,

    @NotBlank(message = "Password is required")
    @Size(min = 8, max = 64, message = "Password must be between 8 and 64 characters")
    @Pattern(
        regexp = "^(?=.*[A-Z])(?=.*\\d).{8,64}$",
        message = "Password must contain at least one uppercase letter and one number"
    )
    String password,

    @NotBlank(message = "Phone is required")
    @Pattern(
        regexp = "^\\+?[0-9]{1,3}[- ]?\\(?[0-9]{2,4}\\)?[- ]?[0-9]{3,4}[- ]?[0-9]{3,4}$",
        message = "Phone format is invalid"
    )
    String phone
) {
}
