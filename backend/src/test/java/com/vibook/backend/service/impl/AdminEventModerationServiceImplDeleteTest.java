package com.vibook.backend.service.impl;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.inOrder;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.vibook.backend.entity.Booking;
import com.vibook.backend.entity.BusinessEvent;
import com.vibook.backend.entity.BusinessEventPhoto;
import com.vibook.backend.mapper.BusinessEventMapper;
import com.vibook.backend.repository.BookingRepository;
import com.vibook.backend.repository.BusinessEventPhotoRepository;
import com.vibook.backend.repository.BusinessEventRepository;
import com.vibook.backend.repository.EventRatingRepository;
import com.vibook.backend.repository.FavoriteRepository;
import com.vibook.backend.repository.PaymentRepository;
import com.vibook.backend.service.BusinessEventService;
import com.vibook.backend.service.EventRatingService;
import com.vibook.backend.service.ProfileImageStorageService;
import java.util.List;
import java.util.Optional;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InOrder;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class AdminEventModerationServiceImplDeleteTest {

    @Mock
    private BusinessEventRepository businessEventRepository;

    @Mock
    private BusinessEventPhotoRepository businessEventPhotoRepository;

    @Mock
    private BusinessEventMapper businessEventMapper;

    @Mock
    private BusinessEventService businessEventService;

    @Mock
    private EventRatingService eventRatingService;

    @Mock
    private BookingRepository bookingRepository;

    @Mock
    private PaymentRepository paymentRepository;

    @Mock
    private EventRatingRepository eventRatingRepository;

    @Mock
    private FavoriteRepository favoriteRepository;

    @Mock
    private ProfileImageStorageService profileImageStorageService;

    @InjectMocks
    private AdminEventModerationServiceImpl service;

    @Test
    void delete_cascadesPaymentsBookingsRatingsFavoritesThenEvent() {
        BusinessEvent event = new BusinessEvent();
        event.setId(42L);

        BusinessEventPhoto photo = new BusinessEventPhoto();
        photo.setImageUrl("/api/v1/files/business-events/test.jpg");
        event.setPhotos(List.of(photo));

        Booking booking = new Booking();
        booking.setId(7L);
        booking.setBusinessEvent(event);

        when(businessEventRepository.findWithDetailsById(42L)).thenReturn(Optional.of(event));
        when(bookingRepository.findByBusinessEvent_Id(42L)).thenReturn(List.of(booking));

        service.delete(42L);

        InOrder order = inOrder(
            paymentRepository,
            bookingRepository,
            eventRatingRepository,
            favoriteRepository,
            profileImageStorageService,
            businessEventRepository
        );
        order.verify(paymentRepository).deleteByBooking_IdIn(eq(List.of(7L)));
        order.verify(bookingRepository).deleteAll(eq(List.of(booking)));
        order.verify(eventRatingRepository).deleteByBusinessEvent_Id(42L);
        order.verify(favoriteRepository).deleteByBusinessEvent_Id(42L);
        order.verify(profileImageStorageService).tryDeleteStoredFile(photo.getImageUrl());
        order.verify(businessEventRepository).delete(event);
        verify(businessEventService, never()).delete(any());
    }
}
