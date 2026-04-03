package com.vibook.web.dto.notification;

import jakarta.validation.constraints.NotNull;

public record PatchNotificationRequest(
        @NotNull Boolean read
) {
}
