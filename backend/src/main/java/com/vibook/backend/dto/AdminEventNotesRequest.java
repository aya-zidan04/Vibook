package com.vibook.backend.dto;

import jakarta.validation.constraints.Size;

public record AdminEventNotesRequest(
    @Size(max = 2000) String notes
) {
}
