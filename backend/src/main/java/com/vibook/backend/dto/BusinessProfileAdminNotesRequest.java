package com.vibook.backend.dto;

import jakarta.validation.constraints.Size;

public record BusinessProfileAdminNotesRequest(@Size(max = 8000) String notes) {
}
