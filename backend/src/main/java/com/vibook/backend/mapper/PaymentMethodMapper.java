package com.vibook.backend.mapper;

import com.vibook.backend.dto.PaymentMethodResponse;
import com.vibook.backend.entity.PaymentMethod;
import org.springframework.stereotype.Component;

@Component
public class PaymentMethodMapper {

    public PaymentMethodResponse toResponse(PaymentMethod entity) {
        return new PaymentMethodResponse(
            entity.getId(),
            entity.getBrand(),
            entity.getCardLast4(),
            entity.getExpiryMonth(),
            entity.getExpiryYear(),
            entity.getCardHolderName(),
            entity.isDefault()
        );
    }
}
