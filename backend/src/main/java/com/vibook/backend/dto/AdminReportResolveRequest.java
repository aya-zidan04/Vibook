package com.vibook.backend.dto;

import jakarta.validation.constraints.Size;

public record AdminReportResolveRequest(
    @Size(max = 2000) String adminNotes
) {
}
