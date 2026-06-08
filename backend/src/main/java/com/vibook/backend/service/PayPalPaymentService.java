package com.vibook.backend.service;

import com.vibook.backend.dto.PayPalCaptureOrderRequest;
import com.vibook.backend.dto.PayPalCaptureOrderResponse;
import com.vibook.backend.dto.PayPalCreateOrderRequest;
import com.vibook.backend.dto.PayPalCreateOrderResponse;
import com.vibook.backend.dto.PayPalSandboxDemoApproveRequest;

public interface PayPalPaymentService {
    PayPalCreateOrderResponse createOrder(PayPalCreateOrderRequest request);

    PayPalCaptureOrderResponse captureOrder(PayPalCaptureOrderRequest request);

    /** Instant fake-money approval for sandbox demos (no PayPal browser). */
    PayPalCaptureOrderResponse approveSandboxDemo(PayPalSandboxDemoApproveRequest request);
}
