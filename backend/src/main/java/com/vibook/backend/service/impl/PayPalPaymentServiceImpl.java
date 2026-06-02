package com.vibook.backend.service.impl;

import com.vibook.backend.config.PayPalProperties;
import com.vibook.backend.dto.PayPalCaptureOrderRequest;
import com.vibook.backend.dto.PayPalCaptureOrderResponse;
import com.vibook.backend.dto.PayPalCreateOrderRequest;
import com.vibook.backend.dto.PayPalCreateOrderResponse;
import com.vibook.backend.entity.Booking;
import com.vibook.backend.entity.BookingStatus;
import com.vibook.backend.entity.Payment;
import com.vibook.backend.entity.PaymentProvider;
import com.vibook.backend.entity.PaymentStatus;
import com.vibook.backend.entity.User;
import com.vibook.backend.exception.BadRequestException;
import com.vibook.backend.exception.NotFoundException;
import com.vibook.backend.exception.UnauthorizedException;
import com.vibook.backend.paypal.PayPalApiClient;
import com.vibook.backend.paypal.PayPalOrderCaptured;
import com.vibook.backend.paypal.PayPalOrderCreated;
import com.vibook.backend.repository.BookingRepository;
import com.vibook.backend.repository.PaymentRepository;
import com.vibook.backend.repository.UserRepository;
import com.vibook.backend.security.AuthenticatedUser;
import com.vibook.backend.service.PayPalPaymentService;
import java.math.BigDecimal;
import java.util.List;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class PayPalPaymentServiceImpl implements PayPalPaymentService {

    private static final List<PaymentStatus> OPEN_PAYMENT_STATUSES = List.of(
        PaymentStatus.CREATED,
        PaymentStatus.APPROVED
    );

    private final PayPalApiClient payPalApiClient;
    private final PayPalProperties payPalProperties;
    private final BookingRepository bookingRepository;
    private final PaymentRepository paymentRepository;
    private final UserRepository userRepository;

    public PayPalPaymentServiceImpl(
        PayPalApiClient payPalApiClient,
        PayPalProperties payPalProperties,
        BookingRepository bookingRepository,
        PaymentRepository paymentRepository,
        UserRepository userRepository
    ) {
        this.payPalApiClient = payPalApiClient;
        this.payPalProperties = payPalProperties;
        this.bookingRepository = bookingRepository;
        this.paymentRepository = paymentRepository;
        this.userRepository = userRepository;
    }

    @Override
    @Transactional
    public PayPalCreateOrderResponse createOrder(PayPalCreateOrderRequest request) {
        User user = getCurrentAuthenticatedUser();
        Booking booking = bookingRepository
            .findByIdAndUser(request.bookingId(), user)
            .orElseThrow(() -> new NotFoundException("Booking not found"));

        if (booking.getStatus() != BookingStatus.PENDING) {
            throw new BadRequestException("Only pending bookings can be paid");
        }

        if (!booking.getBusinessEvent().getId().equals(request.eventId())) {
            throw new BadRequestException("Event id does not match this booking");
        }

        if (request.timeSlotId() != null) {
            if (booking.getTimeSlot() == null || !booking.getTimeSlot().getId().equals(request.timeSlotId())) {
                throw new BadRequestException("Time slot does not match this booking");
            }
        }

        if (paymentRepository.existsByBooking_IdAndStatusIn(booking.getId(), OPEN_PAYMENT_STATUSES)) {
            throw new BadRequestException("A PayPal payment is already in progress for this booking");
        }

        BigDecimal amount = booking.getTotalPriceJod();
        String currency = booking.getBusinessEvent().getCurrency();

        PayPalOrderCreated created = payPalApiClient.createOrder(
            amount,
            currency,
            "booking-" + booking.getId(),
            payPalProperties.returnUrl(),
            payPalProperties.cancelUrl()
        );

        Payment payment = new Payment();
        payment.setBooking(booking);
        payment.setProvider(PaymentProvider.PAYPAL);
        payment.setPaypalOrderId(created.orderId());
        payment.setAmount(amount);
        payment.setCurrency(currency);
        payment.setStatus(PaymentStatus.CREATED);
        payment.setResponseSummary(created.rawSummary());
        Payment saved = paymentRepository.save(payment);

        return new PayPalCreateOrderResponse(
            saved.getId(),
            booking.getId(),
            booking.getBusinessEvent().getId(),
            created.orderId(),
            created.approvalUrl(),
            amount,
            currency,
            saved.getStatus().name(),
            booking.getStatus().name()
        );
    }

    @Override
    @Transactional
    public PayPalCaptureOrderResponse captureOrder(PayPalCaptureOrderRequest request) {
        User user = getCurrentAuthenticatedUser();
        Booking booking = bookingRepository
            .findByIdAndUser(request.bookingId(), user)
            .orElseThrow(() -> new NotFoundException("Booking not found"));

        Payment payment = paymentRepository
            .findByPaypalOrderId(request.paypalOrderId())
            .orElseThrow(() -> new NotFoundException("Payment not found"));

        if (!payment.getBooking().getId().equals(booking.getId())) {
            throw new BadRequestException("Payment does not belong to this booking");
        }

        if (payment.getStatus() == PaymentStatus.CAPTURED) {
            if (booking.getStatus() != BookingStatus.CONFIRMED) {
                booking.setStatus(BookingStatus.CONFIRMED);
                bookingRepository.save(booking);
            }
            return new PayPalCaptureOrderResponse(
                payment.getId(),
                booking.getId(),
                payment.getPaypalOrderId(),
                payment.getPaypalCaptureId(),
                payment.getStatus().name(),
                booking.getStatus().name()
            );
        }

        if (payment.getStatus() == PaymentStatus.FAILED || payment.getStatus() == PaymentStatus.CANCELLED) {
            throw new BadRequestException("This payment can no longer be captured");
        }

        if (booking.getStatus() != BookingStatus.PENDING) {
            throw new BadRequestException("Booking is not awaiting payment");
        }

        try {
            PayPalOrderCaptured captured = payPalApiClient.captureOrder(request.paypalOrderId());
            if (!"COMPLETED".equalsIgnoreCase(captured.status())) {
                payment.setStatus(PaymentStatus.FAILED);
                payment.setResponseSummary(captured.rawSummary());
                paymentRepository.save(payment);
                throw new BadRequestException("PayPal did not complete the capture");
            }

            payment.setStatus(PaymentStatus.CAPTURED);
            payment.setPaypalCaptureId(captured.captureId());
            payment.setResponseSummary(captured.rawSummary());
            paymentRepository.save(payment);

            booking.setStatus(BookingStatus.CONFIRMED);
            bookingRepository.save(booking);

            return new PayPalCaptureOrderResponse(
                payment.getId(),
                booking.getId(),
                payment.getPaypalOrderId(),
                payment.getPaypalCaptureId(),
                payment.getStatus().name(),
                booking.getStatus().name()
            );
        } catch (RuntimeException ex) {
            payment.setStatus(PaymentStatus.FAILED);
            paymentRepository.save(payment);
            throw ex;
        }
    }

    private User getCurrentAuthenticatedUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !(authentication.getPrincipal() instanceof AuthenticatedUser principal)) {
            throw new UnauthorizedException("Unauthorized");
        }
        return userRepository
            .findByEmail(principal.getUsername())
            .orElseThrow(() -> new UnauthorizedException("Unauthorized"));
    }
}
