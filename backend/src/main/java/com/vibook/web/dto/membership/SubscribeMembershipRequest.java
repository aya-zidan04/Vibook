package com.vibook.web.dto.membership;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;

public record SubscribeMembershipRequest(
        @NotNull @Positive Long planId,
        @Size(max = 255) String paymentReference
) {
}
