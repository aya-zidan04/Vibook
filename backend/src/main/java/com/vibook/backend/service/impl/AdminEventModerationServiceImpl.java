package com.vibook.backend.service.impl;

import com.vibook.backend.dto.AdminEventDetailPayload;
import com.vibook.backend.dto.AdminEventNotesRequest;
import com.vibook.backend.dto.AdminEventRowResponse;
import com.vibook.backend.dto.BusinessEventResponse;
import com.vibook.backend.entity.Booking;
import com.vibook.backend.entity.BusinessEvent;
import com.vibook.backend.entity.BusinessEventPhoto;
import com.vibook.backend.exception.NotFoundException;
import com.vibook.backend.mapper.BusinessEventMapper;
import com.vibook.backend.repository.BookingRepository;
import com.vibook.backend.repository.BusinessEventPhotoRepository;
import com.vibook.backend.repository.BusinessEventRepository;
import com.vibook.backend.repository.EventRatingRepository;
import com.vibook.backend.repository.FavoriteRepository;
import com.vibook.backend.repository.PaymentRepository;
import com.vibook.backend.service.AdminEventModerationService;
import com.vibook.backend.service.BusinessEventService;
import com.vibook.backend.service.EventRatingService;
import com.vibook.backend.service.ProfileImageStorageService;
import java.util.List;
import com.vibook.backend.spec.AdminBusinessEventSpecs;
import com.vibook.backend.util.AdminSecurityUtils;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

@Service
public class AdminEventModerationServiceImpl implements AdminEventModerationService {

    private final BusinessEventRepository businessEventRepository;
    private final BusinessEventPhotoRepository businessEventPhotoRepository;
    private final BusinessEventMapper businessEventMapper;
    private final BusinessEventService businessEventService;
    private final EventRatingService eventRatingService;
    private final BookingRepository bookingRepository;
    private final PaymentRepository paymentRepository;
    private final EventRatingRepository eventRatingRepository;
    private final FavoriteRepository favoriteRepository;
    private final ProfileImageStorageService profileImageStorageService;

    public AdminEventModerationServiceImpl(
        BusinessEventRepository businessEventRepository,
        BusinessEventPhotoRepository businessEventPhotoRepository,
        BusinessEventMapper businessEventMapper,
        BusinessEventService businessEventService,
        EventRatingService eventRatingService,
        BookingRepository bookingRepository,
        PaymentRepository paymentRepository,
        EventRatingRepository eventRatingRepository,
        FavoriteRepository favoriteRepository,
        ProfileImageStorageService profileImageStorageService
    ) {
        this.businessEventRepository = businessEventRepository;
        this.businessEventPhotoRepository = businessEventPhotoRepository;
        this.businessEventMapper = businessEventMapper;
        this.businessEventService = businessEventService;
        this.eventRatingService = eventRatingService;
        this.bookingRepository = bookingRepository;
        this.paymentRepository = paymentRepository;
        this.eventRatingRepository = eventRatingRepository;
        this.favoriteRepository = favoriteRepository;
        this.profileImageStorageService = profileImageStorageService;
    }

    @Override
    @Transactional(readOnly = true)
    public Page<AdminEventRowResponse> list(
        Long categoryId,
        Long governorateId,
        String visibility,
        String search,
        Pageable pageable
    ) {
        var spec = AdminBusinessEventSpecs.withFilters(categoryId, governorateId, visibility, search);
        return businessEventRepository
            .findAll(spec, pageable)
            .map(
                event ->
                    businessEventMapper.toAdminRow(
                        event,
                        businessEventPhotoRepository.countByBusinessEvent_Id(event.getId())
                    )
            );
    }

    @Override
    @Transactional(readOnly = true)
    public AdminEventDetailPayload getById(Long id) {
        BusinessEvent event = businessEventRepository
            .findWithDetailsById(id)
            .orElseThrow(() -> new NotFoundException("Event not found"));
        String email = AdminSecurityUtils.requireAuthenticatedUser().getUsername();
        BusinessEventResponse body = eventRatingService.attachViewerRatingFields(event, email);
        return new AdminEventDetailPayload(body, event.getAdminNotes());
    }

    @Override
    @Transactional
    public BusinessEventResponse hide(Long id) {
        return businessEventService.hide(id);
    }

    @Override
    @Transactional
    public BusinessEventResponse show(Long id) {
        return businessEventService.unhide(id);
    }

    @Override
    @Transactional
    public void delete(Long id) {
        BusinessEvent event = businessEventRepository
            .findWithDetailsById(id)
            .orElseThrow(() -> new NotFoundException("Event not found"));

        List<Booking> bookings = bookingRepository.findByBusinessEvent_Id(id);
        if (!bookings.isEmpty()) {
            List<Long> bookingIds = bookings.stream().map(Booking::getId).toList();
            paymentRepository.deleteByBooking_IdIn(bookingIds);
            bookingRepository.deleteAll(bookings);
        }

        eventRatingRepository.deleteByBusinessEvent_Id(id);
        favoriteRepository.deleteByBusinessEvent_Id(id);

        for (BusinessEventPhoto photo : event.getPhotos()) {
            profileImageStorageService.tryDeleteStoredFile(photo.getImageUrl());
        }

        businessEventRepository.delete(event);
    }

    @Override
    @Transactional
    public void updateNotes(Long id, AdminEventNotesRequest request) {
        BusinessEvent event = businessEventRepository.findById(id).orElseThrow(() -> new NotFoundException("Event not found"));
        String notes = request.notes() != null ? request.notes().trim() : "";
        event.setAdminNotes(notes.isEmpty() ? null : notes);
        businessEventRepository.save(event);
    }
}
