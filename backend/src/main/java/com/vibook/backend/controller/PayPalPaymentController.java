package com.vibook.backend.controller;

import com.vibook.backend.dto.PayPalCaptureOrderRequest;
import com.vibook.backend.dto.PayPalCaptureOrderResponse;
import com.vibook.backend.dto.PayPalCreateOrderRequest;
import com.vibook.backend.dto.PayPalCreateOrderResponse;
import com.vibook.backend.dto.PayPalSandboxDemoApproveRequest;
import com.vibook.backend.exception.UnauthorizedException;
import com.vibook.backend.security.AuthenticatedUser;
import com.vibook.backend.service.PayPalPaymentService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/payments/paypal")
public class PayPalPaymentController {

    private final PayPalPaymentService payPalPaymentService;

    public PayPalPaymentController(PayPalPaymentService payPalPaymentService) {
        this.payPalPaymentService = payPalPaymentService;
    }

    @PostMapping("/create-order")
    public ResponseEntity<PayPalCreateOrderResponse> createOrder(
        @AuthenticationPrincipal AuthenticatedUser principal,
        @Valid @RequestBody PayPalCreateOrderRequest request
    ) {
        requirePrincipal(principal);
        return ResponseEntity.ok(payPalPaymentService.createOrder(request));
    }

    @PostMapping("/capture-order")
    public ResponseEntity<PayPalCaptureOrderResponse> captureOrder(
        @AuthenticationPrincipal AuthenticatedUser principal,
        @Valid @RequestBody PayPalCaptureOrderRequest request
    ) {
        requirePrincipal(principal);
        return ResponseEntity.ok(payPalPaymentService.captureOrder(request));
    }

    @PostMapping("/sandbox/demo-approve")
    public ResponseEntity<PayPalCaptureOrderResponse> approveSandboxDemo(
        @AuthenticationPrincipal AuthenticatedUser principal,
        @Valid @RequestBody PayPalSandboxDemoApproveRequest request
    ) {
        requirePrincipal(principal);
        return ResponseEntity.ok(payPalPaymentService.approveSandboxDemo(request));
    }

    private static void requirePrincipal(AuthenticatedUser principal) {
        if (principal == null) {
            throw new UnauthorizedException("Unauthorized");
        }
    }
}
