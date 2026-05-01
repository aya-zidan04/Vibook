package com.vibook.backend.service.impl;

import com.vibook.backend.dto.BookingCreateRequest;
import com.vibook.backend.dto.BookingResponse;
import com.vibook.backend.dto.BookingStatusUpdateRequest;
import com.vibook.backend.dto.CancelBookingRequest;
import com.vibook.backend.entity.Booking;
import com.vibook.backend.entity.BookingStatus;
import com.vibook.backend.entity.BusinessEvent;
import com.vibook.backend.entity.BusinessEventTimeSlot;
import com.vibook.backend.entity.BusinessProfile;
import com.vibook.backend.entity.RoleName;
import com.vibook.backend.entity.User;
import com.vibook.backend.exception.BadRequestException;
import com.vibook.backend.exception.NotFoundException;
import com.vibook.backend.exception.UnauthorizedException;
import com.vibook.backend.mapper.BookingMapper;
import com.vibook.backend.repository.BookingRepository;
import com.vibook.backend.repository.BusinessEventRepository;
import com.vibook.backend.repository.BusinessEventTimeSlotRepository;
import com.vibook.backend.repository.BusinessProfileRepository;
import com.vibook.backend.repository.UserRepository;
import com.vibook.backend.security.AuthenticatedUser;
import com.vibook.backend.service.BookingService;
import java.math.BigDecimal;
import java.util.EnumSet;
import java.util.List;
import java.util.Set;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

@Service
public class BookingServiceImpl implements BookingService {

    /** Bookings that consume capacity (guests counted toward {@link BusinessEvent#getCapacityGuests()}). */
    private static final List<BookingStatus> CAPACITY_COUNT_STATUSES = List.of(BookingStatus.PENDING, BookingStatus.CONFIRMED);

    /**
     * At most one "open" booking per user per event: while PENDING or CONFIRMED.
     * COMPLETED or CANCELLED allows another booking (e.g. book again after attending).
     */
    private static final List<BookingStatus> DUPLICATE_BLOCK_STATUSES = List.of(BookingStatus.PENDING, BookingStatus.CONFIRMED);

    private static final Set<BookingStatus> BUSINESS_ALLOWED_TARGET_STATUSES = EnumSet.of(
        BookingStatus.CONFIRMED,
        BookingStatus.COMPLETED,
        BookingStatus.CANCELLED
    );

    private final BookingRepository bookingRepository;
    private final BusinessEventRepository businessEventRepository;
    private final BusinessEventTimeSlotRepository businessEventTimeSlotRepository;
    private final BusinessProfileRepository businessProfileRepository;
    private final UserRepository userRepository;
    private final BookingMapper bookingMapper;

    public BookingServiceImpl(
        BookingRepository bookingRepository,
        BusinessEventRepository businessEventRepository,
        BusinessEventTimeSlotRepository businessEventTimeSlotRepository,
        BusinessProfileRepository businessProfileRepository,
        UserRepository userRepository,
        BookingMapper bookingMapper
    ) {
        this.bookingRepository = bookingRepository;
        this.businessEventRepository = businessEventRepository;
        this.businessEventTimeSlotRepository = businessEventTimeSlotRepository;
        this.businessProfileRepository = businessProfileRepository;
        this.userRepository = userRepository;
        this.bookingMapper = bookingMapper;
    }

    @Override
    @Transactional
    public BookingResponse createBooking(BookingCreateRequest request) {
        User actor = getCurrentAuthenticatedUser();
        BusinessEvent event = businessEventRepository
            .findWithDetailsById(request.eventId())
            .orElseThrow(() -> new NotFoundException("Event not found"));

        if (event.isHidden() && !isAdmin(actor)) {
            throw new AccessDeniedException("This event is not available for booking");
        }

        if (!isAdmin(actor)) {
            BusinessProfile ownerProfile = event.getBusinessProfile();
            if (ownerProfile.getUser().getId().equals(actor.getId())) {
                throw new BadRequestException("You cannot book your own event");
            }
        }

        if (
            bookingRepository.existsByUserAndBusinessEventAndStatusIn(actor, event, DUPLICATE_BLOCK_STATUSES)
        ) {
            throw new BadRequestException("You already have an active booking for this event");
        }

        BusinessEventTimeSlot slot = null;
        if (request.timeSlotId() != null) {
            slot = businessEventTimeSlotRepository
                .findByIdAndBusinessEvent_Id(request.timeSlotId(), event.getId())
                .orElseThrow(() -> new BadRequestException("Time slot does not belong to this event"));
        }

        int guests = request.guestsCount();
        int used = bookingRepository.sumGuestsByEventIdAndStatusIn(event.getId(), CAPACITY_COUNT_STATUSES);
        if (used + guests > event.getCapacityGuests()) {
            throw new BadRequestException("Not enough capacity for this event");
        }

        BigDecimal total = event.getPriceJod().multiply(BigDecimal.valueOf(guests));

        Booking booking = new Booking();
        booking.setUser(actor);
        booking.setBusinessEvent(event);
        booking.setTimeSlot(slot);
        booking.setGuestsCount(guests);
        booking.setTotalPriceJod(total);
        booking.setNote(blankToNull(request.note()));
        booking.setStatus(BookingStatus.CONFIRMED);

        Booking saved = bookingRepository.save(booking);
        return bookingMapper.toResponse(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public List<BookingResponse> getMyBookings() {
        User user = getCurrentAuthenticatedUser();
        return bookingRepository.findByUserOrderByCreatedAtDesc(user).stream().map(bookingMapper::toResponse).toList();
    }

    @Override
    @Transactional(readOnly = true)
    public BookingResponse getMyBookingById(Long id) {
        User user = getCurrentAuthenticatedUser();
        Booking booking = bookingRepository
            .findByIdAndUser(id, user)
            .orElseThrow(() -> new NotFoundException("Booking not found"));
        return bookingMapper.toResponse(booking);
    }

    @Override
    @Transactional
    public BookingResponse cancelMyBooking(Long id, CancelBookingRequest request) {
        User user = getCurrentAuthenticatedUser();
        Booking booking = bookingRepository
            .findByIdAndUser(id, user)
            .orElseThrow(() -> new NotFoundException("Booking not found"));
        if (booking.getStatus() == BookingStatus.CANCELLED) {
            throw new BadRequestException("Booking is already cancelled");
        }
        booking.setStatus(BookingStatus.CANCELLED);
        if (request != null && StringUtils.hasText(request.reason())) {
            booking.setCancelReason(request.reason().trim());
        } else {
            booking.setCancelReason(null);
        }
        return bookingMapper.toResponse(bookingRepository.save(booking));
    }

    @Override
    @Transactional(readOnly = true)
    public List<BookingResponse> getBookingsForMyBusiness() {
        User user = getCurrentAuthenticatedUser();
        if (isAdmin(user)) {
            return bookingRepository.findAllByOrderByCreatedAtDesc().stream().map(bookingMapper::toResponse).toList();
        }
        BusinessProfile profile = businessProfileRepository
            .findByUser(user)
            .orElseThrow(() -> new NotFoundException("Business profile not found"));
        return bookingRepository
            .findByBusinessEvent_BusinessProfileOrderByCreatedAtDesc(profile)
            .stream()
            .map(bookingMapper::toResponse)
            .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public BookingResponse getBusinessBookingById(Long id) {
        User user = getCurrentAuthenticatedUser();
        if (isAdmin(user)) {
            Booking booking = bookingRepository.findById(id).orElseThrow(() -> new NotFoundException("Booking not found"));
            return bookingMapper.toResponse(booking);
        }
        BusinessProfile profile = businessProfileRepository
            .findByUser(user)
            .orElseThrow(() -> new NotFoundException("Business profile not found"));
        Booking booking = bookingRepository
            .findByIdAndBusinessEvent_BusinessProfile(id, profile)
            .orElseThrow(() -> new NotFoundException("Booking not found"));
        return bookingMapper.toResponse(booking);
    }

    @Override
    @Transactional
    public BookingResponse updateBookingStatusForBusiness(Long id, BookingStatusUpdateRequest request) {
        Booking booking = requireBusinessBookingForMutation(id);
        BookingStatus next = request.status();
        if (!BUSINESS_ALLOWED_TARGET_STATUSES.contains(next)) {
            throw new BadRequestException("Invalid status for this operation");
        }
        if (booking.getStatus() == BookingStatus.CANCELLED) {
            throw new BadRequestException("Cannot change a cancelled booking");
        }
        booking.setStatus(next);
        return bookingMapper.toResponse(bookingRepository.save(booking));
    }

    private Booking requireBusinessBookingForMutation(Long bookingId) {
        User user = getCurrentAuthenticatedUser();
        Booking booking = bookingRepository.findById(bookingId).orElseThrow(() -> new NotFoundException("Booking not found"));
        if (isAdmin(user)) {
            return booking;
        }
        BusinessProfile profile = businessProfileRepository
            .findByUser(user)
            .orElseThrow(() -> new NotFoundException("Business profile not found"));
        if (!booking.getBusinessEvent().getBusinessProfile().getId().equals(profile.getId())) {
            throw new AccessDeniedException("You do not have access to this booking");
        }
        return booking;
    }

    private static String blankToNull(String value) {
        if (!StringUtils.hasText(value)) {
            return null;
        }
        String t = value.trim();
        return t.isEmpty() ? null : t;
    }

    private static boolean isAdmin(User user) {
        return user.getRoles().stream().anyMatch(r -> r.getName() == RoleName.ROLE_ADMIN);
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
