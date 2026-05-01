package com.vibook.backend.mapper;

import com.vibook.backend.dto.AdminBookingResponse;
import com.vibook.backend.dto.BookingResponse;
import com.vibook.backend.entity.Booking;
import com.vibook.backend.entity.BusinessEventTimeSlot;
import org.springframework.stereotype.Component;

@Component
public class BookingMapper {

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
            entity.getUpdatedAt()
        );
    }

    public BookingResponse toResponse(Booking entity) {
        BusinessEventTimeSlot slot = entity.getTimeSlot();
        return new BookingResponse(
            entity.getId(),
            entity.getBusinessEvent().getId(),
            entity.getBusinessEvent().getTitle(),
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
            entity.getUpdatedAt()
        );
    }
}
