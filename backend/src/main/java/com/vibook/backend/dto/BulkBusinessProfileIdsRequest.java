package com.vibook.backend.dto;

import jakarta.validation.constraints.NotEmpty;
import java.util.List;

public record BulkBusinessProfileIdsRequest(@NotEmpty List<Long> ids) {
}
