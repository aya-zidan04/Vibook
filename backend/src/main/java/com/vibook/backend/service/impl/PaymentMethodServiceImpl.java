package com.vibook.backend.service.impl;

import com.vibook.backend.dto.AddPaymentMethodRequest;
import com.vibook.backend.dto.PaymentMethodResponse;
import com.vibook.backend.entity.PaymentMethod;
import com.vibook.backend.entity.User;
import com.vibook.backend.exception.BadRequestException;
import com.vibook.backend.exception.NotFoundException;
import com.vibook.backend.mapper.PaymentMethodMapper;
import com.vibook.backend.repository.PaymentMethodRepository;
import com.vibook.backend.repository.UserRepository;
import com.vibook.backend.service.PaymentMethodService;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class PaymentMethodServiceImpl implements PaymentMethodService {

    private static final int MIN_PAN_DIGITS = 4;

    private final PaymentMethodRepository paymentMethodRepository;
    private final UserRepository userRepository;
    private final PaymentMethodMapper paymentMethodMapper;

    public PaymentMethodServiceImpl(
        PaymentMethodRepository paymentMethodRepository,
        UserRepository userRepository,
        PaymentMethodMapper paymentMethodMapper
    ) {
        this.paymentMethodRepository = paymentMethodRepository;
        this.userRepository = userRepository;
        this.paymentMethodMapper = paymentMethodMapper;
    }

    @Override
    @Transactional
    public PaymentMethodResponse addPaymentMethod(String userEmail, AddPaymentMethodRequest request) {
        User user = userRepository
            .findByEmail(userEmail)
            .orElseThrow(() -> new NotFoundException("User not found"));

        String digitsOnly = request.cardNumber().replaceAll("\\D", "");
        if (digitsOnly.length() < MIN_PAN_DIGITS) {
            throw new BadRequestException("Card number must contain at least 4 digits");
        }

        String last4 = digitsOnly.substring(digitsOnly.length() - MIN_PAN_DIGITS);
        String brand = detectBrand(digitsOnly);
        boolean firstCard = !paymentMethodRepository.existsByUser(user);

        PaymentMethod entity = new PaymentMethod();
        entity.setUser(user);
        entity.setBrand(brand);
        entity.setCardLast4(last4);
        entity.setExpiryMonth(request.expiryMonth());
        entity.setExpiryYear(request.expiryYear());
        entity.setCardHolderName(request.cardHolderName().trim());
        entity.setDefault(firstCard);

        PaymentMethod saved = paymentMethodRepository.save(entity);
        return paymentMethodMapper.toResponse(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public List<PaymentMethodResponse> getMyPaymentMethods(String userEmail) {
        User user = userRepository
            .findByEmail(userEmail)
            .orElseThrow(() -> new NotFoundException("User not found"));

        return paymentMethodRepository
            .findByUserOrderByIsDefaultDescCreatedAtDesc(user)
            .stream()
            .map(paymentMethodMapper::toResponse)
            .toList();
    }

    @Override
    @Transactional
    public PaymentMethodResponse setDefaultPaymentMethod(String userEmail, Long paymentMethodId) {
        User user = userRepository
            .findByEmail(userEmail)
            .orElseThrow(() -> new NotFoundException("User not found"));
        PaymentMethod target = paymentMethodRepository
            .findByIdAndUser_Id(paymentMethodId, user.getId())
            .orElseThrow(() -> new NotFoundException("Payment method not found"));
        List<PaymentMethod> all = paymentMethodRepository.findByUserOrderByCreatedAtDesc(user);
        for (PaymentMethod pm : all) {
            pm.setDefault(pm.getId().equals(target.getId()));
        }
        paymentMethodRepository.saveAll(all);
        return paymentMethodMapper.toResponse(
            paymentMethodRepository.findByIdAndUser_Id(paymentMethodId, user.getId()).orElseThrow()
        );
    }

    @Override
    @Transactional
    public void deletePaymentMethod(String userEmail, Long paymentMethodId) {
        User user = userRepository
            .findByEmail(userEmail)
            .orElseThrow(() -> new NotFoundException("User not found"));
        PaymentMethod target = paymentMethodRepository
            .findByIdAndUser_Id(paymentMethodId, user.getId())
            .orElseThrow(() -> new NotFoundException("Payment method not found"));
        boolean wasDefault = target.isDefault();
        paymentMethodRepository.delete(target);
        if (wasDefault) {
            List<PaymentMethod> remaining = paymentMethodRepository.findByUserOrderByCreatedAtDesc(user);
            if (!remaining.isEmpty()) {
                PaymentMethod next = remaining.get(0);
                next.setDefault(true);
                paymentMethodRepository.save(next);
            }
        }
    }

    private static String detectBrand(String digitsOnly) {
        if (digitsOnly.isEmpty()) {
            return "CARD";
        }
        char first = digitsOnly.charAt(0);
        if (first == '4') {
            return "VISA";
        }
        if (first == '5') {
            return "MASTERCARD";
        }
        return "CARD";
    }
}
