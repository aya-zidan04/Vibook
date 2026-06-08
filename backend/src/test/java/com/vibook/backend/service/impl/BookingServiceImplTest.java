package com.vibook.backend.service.impl;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.vibook.backend.dto.BookingCreateRequest;
import com.vibook.backend.dto.BookingResponse;
import com.vibook.backend.entity.Booking;
import com.vibook.backend.entity.BookingStatus;
import com.vibook.backend.entity.BusinessEvent;
import com.vibook.backend.entity.BusinessEventTimeSlot;
import com.vibook.backend.entity.BusinessProfile;
import com.vibook.backend.entity.User;
import com.vibook.backend.exception.BadRequestException;
import com.vibook.backend.mapper.BookingMapper;
import com.vibook.backend.repository.BookingRepository;
import com.vibook.backend.repository.BusinessEventRepository;
import com.vibook.backend.repository.BusinessEventTimeSlotRepository;
import com.vibook.backend.repository.BusinessProfileRepository;
import com.vibook.backend.repository.UserRepository;
import com.vibook.backend.security.AuthenticatedUser;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
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
class BookingServiceImplTest {

    @Mock
    private BookingRepository bookingRepository;

    @Mock
    private BusinessEventRepository businessEventRepository;

    @Mock
    private BusinessEventTimeSlotRepository businessEventTimeSlotRepository;

    @Mock
    private BusinessProfileRepository businessProfileRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private BookingMapper bookingMapper;

    @InjectMocks
    private BookingServiceImpl service;

    private User buyer;
    private BusinessEvent event;
    private BusinessEventTimeSlot slot;

    @BeforeEach
    void setUp() {
        buyer = new User();
        buyer.setId(6L);
        buyer.setEmail("buyer@example.com");

        BusinessProfile ownerProfile = new BusinessProfile();
        User owner = new User();
        owner.setId(99L);
        ownerProfile.setUser(owner);

        event = new BusinessEvent();
        event.setId(14L);
        event.setTitle("Padel team");
        event.setHidden(false);
        event.setPriceJod(new BigDecimal("10.00"));
        event.setCurrency("JOD");
        event.setCapacityGuests(4);
        event.setEventDate(LocalDate.now().plusDays(10));
        event.setBusinessProfile(ownerProfile);

        slot = new BusinessEventTimeSlot();
        slot.setId(18L);
        slot.setSlotLabel("7:30 PM");
        slot.setSortOrder(0);
        slot.setBusinessEvent(event);
        event.setTimeSlots(List.of(slot));

        SecurityContextHolder.getContext()
            .setAuthentication(new UsernamePasswordAuthenticationToken(new AuthenticatedUser(buyer), null));
        when(userRepository.findByEmail("buyer@example.com")).thenReturn(Optional.of(buyer));
        when(businessEventRepository.findWithDetailsById(14L)).thenReturn(Optional.of(event));
        when(bookingRepository.findFirstByUserAndBusinessEventAndStatusInOrderByCreatedAtDesc(eq(buyer), eq(event), any()))
            .thenReturn(Optional.empty());
    }

    @AfterEach
    void tearDown() {
        SecurityContextHolder.clearContext();
    }

    @Test
    void createBooking_persistsSelectedTimeSlot() {
        when(bookingRepository.sumGuestsByEventIdAndStatusIn(eq(14L), any())).thenReturn(0);
        when(businessEventTimeSlotRepository.findByIdAndBusinessEvent_Id(18L, 14L)).thenReturn(Optional.of(slot));
        when(bookingRepository.save(any(Booking.class))).thenAnswer(inv -> {
            Booking b = inv.getArgument(0);
            b.setId(1L);
            return b;
        });
        when(bookingMapper.toResponse(any(Booking.class))).thenReturn(
            new BookingResponse(
                1L,
                14L,
                "Padel team",
                null,
                List.of(),
                6L,
                "buyer@example.com",
                "Buyer",
                "Test",
                "Buyer Test",
                "+962700000000",
                BookingStatus.PENDING,
                event.getEventDate(),
                18L,
                "7:30 PM",
                1,
                new BigDecimal("10.00"),
                "JOD",
                null,
                null,
                null,
                null
            )
        );

        BookingResponse response = service.createBooking(new BookingCreateRequest(14L, 18L, 1, null));

        ArgumentCaptor<Booking> captor = ArgumentCaptor.forClass(Booking.class);
        verify(bookingRepository).save(captor.capture());
        assertThat(captor.getValue().getTimeSlot()).isEqualTo(slot);
        assertThat(response.timeSlotId()).isEqualTo(18L);
        assertThat(response.timeSlotLabel()).isEqualTo("7:30 PM");
    }

    @Test
    void createBooking_rejectsMissingSlotWhenEventHasSlots() {
        assertThatThrownBy(() -> service.createBooking(new BookingCreateRequest(14L, null, 1, null)))
            .isInstanceOf(BadRequestException.class)
            .hasMessageContaining("Time slot is required");
    }

    @Test
    void createBooking_allowsBusinessOwnerToBookOwnEvent() {
        User owner = event.getBusinessProfile().getUser();
        owner.setEmail("owner@example.com");
        buyer.setId(owner.getId());
        SecurityContextHolder.getContext()
            .setAuthentication(new UsernamePasswordAuthenticationToken(new AuthenticatedUser(buyer), null));
        when(userRepository.findByEmail("buyer@example.com")).thenReturn(Optional.of(buyer));
        when(bookingRepository.sumGuestsByEventIdAndStatusIn(eq(14L), any())).thenReturn(0);
        when(businessEventTimeSlotRepository.findByIdAndBusinessEvent_Id(18L, 14L)).thenReturn(Optional.of(slot));
        when(bookingRepository.save(any(Booking.class))).thenAnswer(inv -> {
            Booking b = inv.getArgument(0);
            b.setId(2L);
            return b;
        });
        when(bookingMapper.toResponse(any(Booking.class))).thenReturn(
            new BookingResponse(
                2L,
                14L,
                "Padel team",
                null,
                List.of(),
                owner.getId(),
                "owner@example.com",
                "Owner",
                "User",
                "Owner User",
                "+962700000000",
                BookingStatus.PENDING,
                event.getEventDate(),
                18L,
                "7:30 PM",
                1,
                new BigDecimal("10.00"),
                "JOD",
                null,
                null,
                null,
                null
            )
        );

        BookingResponse response = service.createBooking(new BookingCreateRequest(14L, 18L, 1, null));

        assertThat(response.id()).isEqualTo(2L);
        verify(bookingRepository).save(any(Booking.class));
    }

    @Test
    void createBooking_returnsExistingPendingInsteadOfDuplicateError() {
        Booking pending = new Booking();
        pending.setId(9L);
        pending.setUser(buyer);
        pending.setBusinessEvent(event);
        pending.setStatus(BookingStatus.PENDING);
        when(bookingRepository.findFirstByUserAndBusinessEventAndStatusInOrderByCreatedAtDesc(eq(buyer), eq(event), any()))
            .thenReturn(Optional.of(pending));
        when(bookingMapper.toResponse(pending)).thenReturn(
            new BookingResponse(
                9L,
                14L,
                "Padel team",
                null,
                List.of(),
                6L,
                "buyer@example.com",
                "Buyer",
                "Test",
                "Buyer Test",
                "+962700000000",
                BookingStatus.PENDING,
                event.getEventDate(),
                null,
                null,
                1,
                new BigDecimal("10.00"),
                "JOD",
                null,
                null,
                null,
                null
            )
        );

        BookingResponse response = service.createBooking(new BookingCreateRequest(14L, 18L, 1, null));

        assertThat(response.id()).isEqualTo(9L);
        org.mockito.Mockito.verify(bookingRepository, org.mockito.Mockito.never()).save(any(Booking.class));
    }

    @Test
    void createBooking_rejectsSlotNotOnEvent() {
        when(businessEventTimeSlotRepository.findByIdAndBusinessEvent_Id(99L, 14L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> service.createBooking(new BookingCreateRequest(14L, 99L, 1, null)))
            .isInstanceOf(BadRequestException.class)
            .hasMessageContaining("does not belong");
    }
}
