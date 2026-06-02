package com.vibook.backend.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.vibook.backend.config.PayPalProperties;
import com.vibook.backend.dto.PayPalCaptureOrderRequest;
import com.vibook.backend.dto.PayPalCreateOrderRequest;
import com.vibook.backend.entity.Booking;
import com.vibook.backend.entity.BookingStatus;
import com.vibook.backend.entity.BusinessEvent;
import com.vibook.backend.entity.Payment;
import com.vibook.backend.entity.PaymentStatus;
import com.vibook.backend.entity.User;
import com.vibook.backend.paypal.PayPalApiClient;
import com.vibook.backend.paypal.PayPalOrderCaptured;
import com.vibook.backend.paypal.PayPalOrderCreated;
import com.vibook.backend.repository.BookingRepository;
import com.vibook.backend.repository.PaymentRepository;
import com.vibook.backend.repository.UserRepository;
import com.vibook.backend.security.AuthenticatedUser;
import com.vibook.backend.service.impl.PayPalPaymentServiceImpl;
import java.math.BigDecimal;
import java.util.Optional;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;

@ExtendWith(MockitoExtension.class)
class PayPalPaymentServiceImplTest {

    @Mock
    private PayPalApiClient payPalApiClient;

    @Mock
    private PayPalProperties payPalProperties;

    @Mock
    private BookingRepository bookingRepository;

    @Mock
    private PaymentRepository paymentRepository;

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private PayPalPaymentServiceImpl service;

    private User user;
    private Booking booking;
    private BusinessEvent event;

    @BeforeEach
    void setUp() {
        user = new User();
        user.setId(1L);
        user.setEmail("buyer@example.com");

        event = new BusinessEvent();
        event.setId(10L);
        event.setPriceJod(new BigDecimal("25.00"));
        event.setCurrency("JOD");

        booking = new Booking();
        booking.setId(100L);
        booking.setUser(user);
        booking.setBusinessEvent(event);
        booking.setGuestsCount(2);
        booking.setTotalPriceJod(new BigDecimal("50.00"));
        booking.setStatus(BookingStatus.PENDING);

        SecurityContextHolder.getContext()
            .setAuthentication(new UsernamePasswordAuthenticationToken(new AuthenticatedUser(user), null));
        when(userRepository.findByEmail("buyer@example.com")).thenReturn(Optional.of(user));
    }

    @AfterEach
    void tearDown() {
        SecurityContextHolder.clearContext();
    }

    @Test
    void createOrder_usesBookingAmountFromServer() {
        when(payPalProperties.returnUrl()).thenReturn("vibook://paypal-return");
        when(payPalProperties.cancelUrl()).thenReturn("vibook://paypal-cancel");
        when(bookingRepository.findByIdAndUser(100L, user)).thenReturn(Optional.of(booking));
        when(paymentRepository.existsByBooking_IdAndStatusIn(eq(100L), any())).thenReturn(false);
        when(payPalApiClient.createOrder(any(), eq("JOD"), eq("booking-100"), any(), any()))
            .thenReturn(new PayPalOrderCreated("ORDER-1", "https://sandbox.paypal.com/approve", "{}"));
        when(paymentRepository.save(any(Payment.class))).thenAnswer(inv -> {
            Payment p = inv.getArgument(0);
            p.setId(5L);
            return p;
        });

        var response = service.createOrder(new PayPalCreateOrderRequest(100L, 10L, null));

        assertThat(response.paypalOrderId()).isEqualTo("ORDER-1");
        assertThat(response.amount()).isEqualByComparingTo("50.00");
        assertThat(response.bookingStatus()).isEqualTo("PENDING");

        ArgumentCaptor<BigDecimal> amountCaptor = ArgumentCaptor.forClass(BigDecimal.class);
        verify(payPalApiClient).createOrder(amountCaptor.capture(), eq("JOD"), eq("booking-100"), any(), any());
        assertThat(amountCaptor.getValue()).isEqualByComparingTo("50.00");
    }

    @Test
    void captureOrder_confirmsBookingOnlyAfterPayPalSuccess() {
        Payment payment = new Payment();
        payment.setId(5L);
        payment.setBooking(booking);
        payment.setPaypalOrderId("ORDER-1");
        payment.setStatus(PaymentStatus.CREATED);
        payment.setAmount(new BigDecimal("50.00"));
        payment.setCurrency("JOD");

        when(bookingRepository.findByIdAndUser(100L, user)).thenReturn(Optional.of(booking));
        when(paymentRepository.findByPaypalOrderId("ORDER-1")).thenReturn(Optional.of(payment));
        when(payPalApiClient.captureOrder("ORDER-1"))
            .thenReturn(new PayPalOrderCaptured("ORDER-1", "CAP-1", "COMPLETED", "{}"));
        when(paymentRepository.save(any(Payment.class))).thenAnswer(inv -> inv.getArgument(0));
        when(bookingRepository.save(any(Booking.class))).thenAnswer(inv -> inv.getArgument(0));

        var response = service.captureOrder(new PayPalCaptureOrderRequest("ORDER-1", 100L));

        assertThat(response.paymentStatus()).isEqualTo("CAPTURED");
        assertThat(response.bookingStatus()).isEqualTo("CONFIRMED");
        assertThat(booking.getStatus()).isEqualTo(BookingStatus.CONFIRMED);
    }

    @Test
    void captureOrder_duplicateCapture_returnsExistingWithoutNewPayment() {
        Payment payment = new Payment();
        payment.setId(5L);
        payment.setBooking(booking);
        payment.setPaypalOrderId("ORDER-1");
        payment.setStatus(PaymentStatus.CAPTURED);
        payment.setPaypalCaptureId("CAP-1");
        booking.setStatus(BookingStatus.CONFIRMED);

        when(bookingRepository.findByIdAndUser(100L, user)).thenReturn(Optional.of(booking));
        when(paymentRepository.findByPaypalOrderId("ORDER-1")).thenReturn(Optional.of(payment));

        var response = service.captureOrder(new PayPalCaptureOrderRequest("ORDER-1", 100L));

        assertThat(response.paymentStatus()).isEqualTo("CAPTURED");
        assertThat(response.bookingStatus()).isEqualTo("CONFIRMED");
        verify(payPalApiClient, org.mockito.Mockito.never()).captureOrder(org.mockito.ArgumentMatchers.anyString());
    }

    @Test
    void captureOrder_doesNotConfirmWhenPayPalNotCompleted() {
        Payment payment = new Payment();
        payment.setId(5L);
        payment.setBooking(booking);
        payment.setPaypalOrderId("ORDER-1");
        payment.setStatus(PaymentStatus.CREATED);

        when(bookingRepository.findByIdAndUser(100L, user)).thenReturn(Optional.of(booking));
        when(paymentRepository.findByPaypalOrderId("ORDER-1")).thenReturn(Optional.of(payment));
        when(payPalApiClient.captureOrder("ORDER-1"))
            .thenReturn(new PayPalOrderCaptured("ORDER-1", null, "PAYER_ACTION_REQUIRED", "{}"));
        when(paymentRepository.save(any(Payment.class))).thenAnswer(inv -> inv.getArgument(0));

        assertThatThrownBy(() -> service.captureOrder(new PayPalCaptureOrderRequest("ORDER-1", 100L)))
            .hasMessageContaining("did not complete");

        assertThat(booking.getStatus()).isEqualTo(BookingStatus.PENDING);
        assertThat(payment.getStatus()).isEqualTo(PaymentStatus.FAILED);
    }
}
