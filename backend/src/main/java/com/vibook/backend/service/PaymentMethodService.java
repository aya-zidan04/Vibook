package com.vibook.backend.service;

import com.vibook.backend.dto.AddPaymentMethodRequest;
import com.vibook.backend.dto.PaymentMethodResponse;
import java.util.List;

public interface PaymentMethodService {

    PaymentMethodResponse addPaymentMethod(String userEmail, AddPaymentMethodRequest request);

    List<PaymentMethodResponse> getMyPaymentMethods(String userEmail);

    PaymentMethodResponse setDefaultPaymentMethod(String userEmail, Long paymentMethodId);

    void deletePaymentMethod(String userEmail, Long paymentMethodId);
}
