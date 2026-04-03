package com.vibook.web.dto.business;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record CreateBusinessLeadRequest(
        @NotBlank @Size(max = 300) String companyName,
        @NotBlank @Email @Size(max = 255) String email,
        @NotBlank @Size(max = 32) String phone,
        @NotBlank @Size(max = 120) String category,
        @NotBlank @Size(max = 4000) String message
) {
}
