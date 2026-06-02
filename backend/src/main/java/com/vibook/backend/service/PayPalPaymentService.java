package com.vibook.backend.service;

import com.vibook.backend.dto.PayPalCaptureOrderRequest;
import com.vibook.backend.dto.PayPalCaptureOrderResponse;
import com.vibook.backend.dto.PayPalCreateOrderRequest;
import com.vibook.backend.dto.PayPalCreateOrderResponse;

public interface PayPalPaymentService {
    PayPalCreateOrderResponse createOrder(PayPalCreateOrderRequest request);

    PayPalCaptureOrderResponse captureOrder(PayPalCaptureOrderRequest request);
}
