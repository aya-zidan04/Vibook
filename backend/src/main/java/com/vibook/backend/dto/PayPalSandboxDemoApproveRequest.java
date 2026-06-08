package com.vibook.backend.dto;

import jakarta.validation.constraints.NotNull;

public record PayPalSandboxDemoApproveRequest(@NotNull Long bookingId) {}
