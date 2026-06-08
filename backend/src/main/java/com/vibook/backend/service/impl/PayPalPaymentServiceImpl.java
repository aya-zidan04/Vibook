package com.vibook.backend.service.impl;

import com.vibook.backend.config.PayPalProperties;
import com.vibook.backend.dto.PayPalCaptureOrderRequest;
import com.vibook.backend.dto.PayPalCaptureOrderResponse;
import com.vibook.backend.dto.PayPalCreateOrderRequest;
import com.vibook.backend.dto.PayPalCreateOrderResponse;
import com.vibook.backend.dto.PayPalSandboxDemoApproveRequest;
import com.vibook.backend.entity.Booking;
import com.vibook.backend.entity.BookingStatus;
import com.vibook.backend.entity.Payment;
import com.vibook.backend.entity.PaymentProvider;
import com.vibook.backend.entity.PaymentStatus;
import com.vibook.backend.entity.User;
import com.vibook.backend.exception.BadRequestException;
import com.vibook.backend.exception.NotFoundException;
import com.vibook.backend.exception.UnauthorizedException;
import com.vibook.backend.exception.PayPalApiException;
import com.vibook.backend.paypal.PayPalApiClient;
import com.vibook.backend.paypal.PayPalCheckoutCurrency;
import com.vibook.backend.paypal.PayPalOrderCaptured;
import com.vibook.backend.paypal.PayPalOrderCreated;
import com.vibook.backend.repository.BookingRepository;
import com.vibook.backend.repository.PaymentRepository;
import com.vibook.backend.repository.UserRepository;
import com.vibook.backend.security.AuthenticatedUser;
import com.vibook.backend.service.PayPalPaymentService;
import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;
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

        BigDecimal bookingAmount = booking.getTotalPriceJod();
        String eventCurrency = booking.getBusinessEvent().getCurrency();
        PayPalCheckoutCurrency.CheckoutAmount checkout;
        try {
            checkout = PayPalCheckoutCurrency.forOrder(
                bookingAmount,
                eventCurrency,
                "sandbox".equalsIgnoreCase(payPalProperties.mode())
            );
        } catch (IllegalArgumentException ex) {
            throw new BadRequestException(ex.getMessage());
        }

        PayPalOrderCreated created;
        try {
            created = payPalApiClient.createOrder(
                checkout.amount(),
                checkout.currencyCode(),
                "booking-" + booking.getId(),
                payPalProperties.returnUrl(),
                payPalProperties.cancelUrl()
            );
        } catch (PayPalApiException ex) {
            throw new BadRequestException(ex.getMessage());
        }

        Payment payment = new Payment();
        payment.setBooking(booking);
        payment.setProvider(PaymentProvider.PAYPAL);
        payment.setPaypalOrderId(created.orderId());
        payment.setAmount(checkout.amount());
        payment.setCurrency(checkout.currencyCode());
        payment.setStatus(PaymentStatus.CREATED);
        payment.setResponseSummary(created.rawSummary());
        Payment saved = paymentRepository.save(payment);

        return new PayPalCreateOrderResponse(
            saved.getId(),
            booking.getId(),
            booking.getBusinessEvent().getId(),
            created.orderId(),
            created.approvalUrl(),
            checkout.amount(),
            checkout.currencyCode(),
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

    @Override
    @Transactional
    public PayPalCaptureOrderResponse approveSandboxDemo(PayPalSandboxDemoApproveRequest request) {
        payPalProperties.requireSandbox();
        User user = getCurrentAuthenticatedUser();
        Booking booking = bookingRepository
            .findByIdAndUser(request.bookingId(), user)
            .orElseThrow(() -> new NotFoundException("Booking not found"));

        Optional<Payment> existingCaptured = paymentRepository.findFirstByBooking_IdAndStatus(
            booking.getId(),
            PaymentStatus.CAPTURED
        );
        if (existingCaptured.isPresent()) {
            Payment payment = existingCaptured.get();
            if (booking.getStatus() != BookingStatus.CONFIRMED) {
                booking.setStatus(BookingStatus.CONFIRMED);
                bookingRepository.save(booking);
            }
            return toCaptureResponse(payment, booking);
        }

        if (booking.getStatus() == BookingStatus.CONFIRMED) {
            return toCaptureResponse(createDemoPayment(booking), booking);
        }

        if (booking.getStatus() != BookingStatus.PENDING) {
            throw new BadRequestException("This booking cannot be paid");
        }

        Payment saved = createDemoPayment(booking);

        booking.setStatus(BookingStatus.CONFIRMED);
        bookingRepository.save(booking);

        return toCaptureResponse(saved, booking);
    }

    private Payment createDemoPayment(Booking booking) {
        PayPalCheckoutCurrency.CheckoutAmount checkout = PayPalCheckoutCurrency.forOrder(
            booking.getTotalPriceJod(),
            booking.getBusinessEvent().getCurrency(),
            true
        );

        Payment payment = new Payment();
        payment.setBooking(booking);
        payment.setProvider(PaymentProvider.PAYPAL);
        payment.setPaypalOrderId("SANDBOX-DEMO-" + booking.getId());
        payment.setPaypalCaptureId("SANDBOX-CAP-" + booking.getId());
        payment.setAmount(checkout.amount());
        payment.setCurrency(checkout.currencyCode());
        payment.setStatus(PaymentStatus.CAPTURED);
        payment.setResponseSummary("{\"demo\":true,\"mode\":\"sandbox\",\"message\":\"Fake money approved for demo\"}");
        return paymentRepository.save(payment);
    }

    private PayPalCaptureOrderResponse toCaptureResponse(Payment payment, Booking booking) {
        return new PayPalCaptureOrderResponse(
            payment.getId(),
            booking.getId(),
            payment.getPaypalOrderId(),
            payment.getPaypalCaptureId(),
            payment.getStatus().name(),
            booking.getStatus().name()
        );
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
