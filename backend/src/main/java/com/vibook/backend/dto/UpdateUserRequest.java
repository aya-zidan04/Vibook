package com.vibook.backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record UpdateUserRequest(
    @NotBlank(message = "First name is required")
    @Size(max = 80, message = "First name must not exceed 80 characters")
    String firstName,

    @NotBlank(message = "Last name is required")
    @Size(max = 80, message = "Last name must not exceed 80 characters")
    String lastName,

    @NotBlank(message = "Phone is required")
    @Pattern(
        regexp = "^\\+?[0-9]{1,3}[- ]?\\(?[0-9]{2,4}\\)?[- ]?[0-9]{3,4}[- ]?[0-9]{3,4}$",
        message = "Phone format is invalid"
    )
    String phone
) {
}
