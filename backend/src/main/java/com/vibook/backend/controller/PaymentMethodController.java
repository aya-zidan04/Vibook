package com.vibook.backend.controller;

import com.vibook.backend.dto.AddPaymentMethodRequest;
import com.vibook.backend.dto.PaymentMethodResponse;
import com.vibook.backend.exception.UnauthorizedException;
import com.vibook.backend.security.AuthenticatedUser;
import com.vibook.backend.service.PaymentMethodService;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/users/me/payment-methods")
public class PaymentMethodController {

    private final PaymentMethodService paymentMethodService;

    public PaymentMethodController(PaymentMethodService paymentMethodService) {
        this.paymentMethodService = paymentMethodService;
    }

    @PostMapping
    public ResponseEntity<PaymentMethodResponse> addPaymentMethod(
        @AuthenticationPrincipal AuthenticatedUser principal,
        @Valid @RequestBody AddPaymentMethodRequest request
    ) {
        requirePrincipal(principal);
        return ResponseEntity.ok(paymentMethodService.addPaymentMethod(principal.getUsername(), request));
    }

    @GetMapping
    public ResponseEntity<List<PaymentMethodResponse>> getMyPaymentMethods(
        @AuthenticationPrincipal AuthenticatedUser principal
    ) {
        requirePrincipal(principal);
        return ResponseEntity.ok(paymentMethodService.getMyPaymentMethods(principal.getUsername()));
    }

    private static void requirePrincipal(AuthenticatedUser principal) {
        if (principal == null) {
            throw new UnauthorizedException("Unauthorized");
        }
    }
}
