package com.vibook.backend.dto;

import jakarta.validation.constraints.NotEmpty;
import java.util.List;

public record BulkBusinessProfileRejectRequest(@NotEmpty List<Long> ids, String reason) {
}
