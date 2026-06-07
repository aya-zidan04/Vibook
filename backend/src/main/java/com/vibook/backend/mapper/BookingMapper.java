package com.vibook.backend.mapper;

import com.vibook.backend.dto.AdminBookingPaymentInfo;
import com.vibook.backend.dto.AdminBookingResponse;
import com.vibook.backend.dto.BookingResponse;
import com.vibook.backend.entity.Booking;
import com.vibook.backend.entity.BookingStatus;
import com.vibook.backend.entity.BusinessEvent;
import com.vibook.backend.entity.BusinessEventPhoto;
import com.vibook.backend.entity.BusinessEventTimeSlot;
import com.vibook.backend.entity.Payment;
import com.vibook.backend.entity.User;
import com.vibook.backend.entity.PaymentStatus;
import com.vibook.backend.repository.PaymentRepository;
import java.util.Comparator;
import java.util.List;
import org.springframework.stereotype.Component;

@Component
public class BookingMapper {

    private final PaymentRepository paymentRepository;

    public BookingMapper(PaymentRepository paymentRepository) {
        this.paymentRepository = paymentRepository;
    }

    public AdminBookingResponse toAdminResponse(Booking entity) {
        BusinessEventTimeSlot slot = entity.getTimeSlot();
        var profile = entity.getBusinessEvent().getBusinessProfile();
        return new AdminBookingResponse(
            entity.getId(),
            entity.getBusinessEvent().getId(),
            entity.getBusinessEvent().getTitle(),
            profile.getId(),
            profile.getBusinessName(),
            entity.getUser().getId(),
            entity.getUser().getEmail(),
            entity.getStatus(),
            entity.getBusinessEvent().getEventDate(),
            slot != null ? slot.getId() : null,
            slot != null ? slot.getSlotLabel() : null,
            entity.getGuestsCount(),
            entity.getTotalPriceJod(),
            entity.getNote(),
            entity.getCancelReason(),
            entity.getCreatedAt(),
            entity.getUpdatedAt(),
            resolvePaymentInfo(entity)
        );
    }

    private AdminBookingPaymentInfo resolvePaymentInfo(Booking booking) {
        return paymentRepository
            .findTopByBooking_IdOrderByCreatedAtDesc(booking.getId())
            .map(payment -> toPaymentInfo(payment, booking))
            .orElse(null);
    }

    private static AdminBookingPaymentInfo toPaymentInfo(Payment payment, Booking booking) {
        boolean confirmedByPayPal =
            payment.getStatus() == PaymentStatus.CAPTURED && booking.getStatus() == BookingStatus.CONFIRMED;
        return new AdminBookingPaymentInfo(
            payment.getId(),
            payment.getProvider().name(),
            payment.getStatus().name(),
            payment.getPaypalOrderId(),
            payment.getPaypalCaptureId(),
            payment.getAmount(),
            payment.getCurrency(),
            confirmedByPayPal
        );
    }

    public BookingResponse toResponse(Booking entity) {
        BusinessEventTimeSlot slot = entity.getTimeSlot();
        BusinessEvent event = entity.getBusinessEvent();
        User guest = entity.getUser();
        return new BookingResponse(
            entity.getId(),
            event.getId(),
            event.getTitle(),
            primaryPhotoUrl(event),
            eventPhotoUrls(event),
            guest.getId(),
            guest.getEmail(),
            guest.getFirstName(),
            guest.getLastName(),
            userFullName(guest),
            guest.getPhone(),
            entity.getStatus(),
            entity.getBusinessEvent().getEventDate(),
            slot != null ? slot.getId() : null,
            slot != null ? slot.getSlotLabel() : null,
            entity.getGuestsCount(),
            entity.getTotalPriceJod(),
            event.getCurrency(),
            entity.getNote(),
            entity.getCancelReason(),
            entity.getCreatedAt(),
            entity.getUpdatedAt()
        );
    }

    private static List<String> eventPhotoUrls(BusinessEvent event) {
        if (event.getPhotos() == null || event.getPhotos().isEmpty()) {
            return List.of();
        }
        return event.getPhotos().stream()
            .sorted(Comparator.comparingInt(BusinessEventPhoto::getSortOrder))
            .map(BusinessEventPhoto::getImageUrl)
            .toList();
    }

    private static String primaryPhotoUrl(BusinessEvent event) {
        List<String> urls = eventPhotoUrls(event);
        return urls.isEmpty() ? null : urls.get(0);
    }

    private static String userFullName(User user) {
        if (user == null) {
            return null;
        }
        String first = user.getFirstName() != null ? user.getFirstName().trim() : "";
        String last = user.getLastName() != null ? user.getLastName().trim() : "";
        String full = (first + " " + last).trim();
        return full.isEmpty() ? null : full;
    }
}
