package com.vibook.backend.service.impl;

import com.vibook.backend.dto.BusinessEventResponse;
import com.vibook.backend.dto.EventRatingResponse;
import com.vibook.backend.entity.BookingStatus;
import com.vibook.backend.entity.BusinessEvent;
import com.vibook.backend.entity.EventRating;
import com.vibook.backend.entity.RoleName;
import com.vibook.backend.entity.User;
import com.vibook.backend.exception.BadRequestException;
import com.vibook.backend.exception.ForbiddenException;
import com.vibook.backend.exception.ResourceNotFoundException;
import com.vibook.backend.exception.UnauthorizedException;
import com.vibook.backend.mapper.BusinessEventMapper;
import com.vibook.backend.mapper.EventRatingMapper;
import com.vibook.backend.repository.BookingRepository;
import com.vibook.backend.repository.BusinessEventRepository;
import com.vibook.backend.repository.EventRatingRepository;
import com.vibook.backend.repository.UserRepository;
import com.vibook.backend.service.EventRatingService;
import java.util.List;
import java.util.Optional;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class EventRatingServiceImpl implements EventRatingService {

    private static final List<BookingStatus> RATING_ELIGIBLE_STATUSES = List.of(
        BookingStatus.CONFIRMED,
        BookingStatus.COMPLETED
    );

    private final UserRepository userRepository;
    private final BusinessEventRepository businessEventRepository;
    private final BookingRepository bookingRepository;
    private final EventRatingRepository eventRatingRepository;
    private final EventRatingMapper eventRatingMapper;
    private final BusinessEventMapper businessEventMapper;

    public EventRatingServiceImpl(
        UserRepository userRepository,
        BusinessEventRepository businessEventRepository,
        BookingRepository bookingRepository,
        EventRatingRepository eventRatingRepository,
        EventRatingMapper eventRatingMapper,
        BusinessEventMapper businessEventMapper
    ) {
        this.userRepository = userRepository;
        this.businessEventRepository = businessEventRepository;
        this.bookingRepository = bookingRepository;
        this.eventRatingRepository = eventRatingRepository;
        this.eventRatingMapper = eventRatingMapper;
        this.businessEventMapper = businessEventMapper;
    }

    @Override
    @Transactional
    public EventRatingResponse rateEvent(Long eventId, Integer rating, String userEmail) {
        User user = userRepository
            .findByEmail(userEmail)
            .orElseThrow(() -> new UnauthorizedException("Unauthorized"));

        BusinessEvent event = businessEventRepository
            .findWithDetailsById(eventId)
            .orElseThrow(() -> new ResourceNotFoundException("Event not found"));

        int ratingValue = validateRating(rating);

        boolean eligible = bookingRepository.existsByUserAndBusinessEventAndStatusIn(
            user,
            event,
            RATING_ELIGIBLE_STATUSES
        );
        if (!eligible) {
            throw new ForbiddenException("You can only rate events you have booked");
        }

        Optional<EventRating> existingOpt = eventRatingRepository.findByUserAndBusinessEvent(user, event);
        EventRating savedRating;

        if (existingOpt.isEmpty()) {
            int oldCount = event.getReviewCount();
            double oldAvg = event.getAverageRating();
            int newCount = oldCount + 1;
            double newAvg = (oldAvg * oldCount + ratingValue) / newCount;
            event.setReviewCount(newCount);
            event.setAverageRating(roundAvg(newAvg));

            EventRating created = new EventRating();
            created.setUser(user);
            created.setBusinessEvent(event);
            created.setRatingValue(ratingValue);
            savedRating = eventRatingRepository.save(created);
        } else {
            EventRating existing = existingOpt.get();
            int previousValue = existing.getRatingValue();
            existing.setRatingValue(ratingValue);
            savedRating = eventRatingRepository.save(existing);

            int count = event.getReviewCount();
            double oldAvg = event.getAverageRating();
            if (count <= 0) {
                event.setReviewCount(1);
                event.setAverageRating(roundAvg(ratingValue));
            } else {
                double total = oldAvg * count - previousValue + ratingValue;
                event.setAverageRating(roundAvg(total / count));
            }
        }

        businessEventRepository.save(event);
        boolean canRate = bookingRepository.existsByUserAndBusinessEventAndStatusIn(
            user,
            event,
            RATING_ELIGIBLE_STATUSES
        );
        return eventRatingMapper.toResponse(event, ratingValue, savedRating.getId(), canRate);
    }

    @Override
    @Transactional(readOnly = true)
    public BusinessEventResponse getEventForPublic(Long eventId) {
        BusinessEvent event = businessEventRepository
            .findWithDetailsById(eventId)
            .orElseThrow(() -> new ResourceNotFoundException("Event not found"));
        if (event.isHidden()) {
            throw new ResourceNotFoundException("Event not found");
        }
        return businessEventMapper.toResponse(event);
    }

    @Override
    @Transactional(readOnly = true)
    public BusinessEventResponse getEventForViewer(Long eventId, String userEmail) {
        User user = userRepository
            .findByEmail(userEmail)
            .orElseThrow(() -> new UnauthorizedException("Unauthorized"));
        BusinessEvent event = businessEventRepository
            .findWithDetailsById(eventId)
            .orElseThrow(() -> new ResourceNotFoundException("Event not found"));
        if (!canViewerSeeEvent(user, event)) {
            throw new ResourceNotFoundException("Event not found");
        }
        return buildViewerBusinessEventResponse(user, event);
    }

    @Override
    @Transactional(readOnly = true)
    public BusinessEventResponse attachViewerRatingFields(BusinessEvent event, String userEmail) {
        User user = userRepository
            .findByEmail(userEmail)
            .orElseThrow(() -> new UnauthorizedException("Unauthorized"));
        return buildViewerBusinessEventResponse(user, event);
    }

    private BusinessEventResponse buildViewerBusinessEventResponse(User user, BusinessEvent event) {
        Optional<EventRating> ratingOpt = eventRatingRepository.findByUserAndBusinessEvent(user, event);
        Integer myRating = ratingOpt.map(EventRating::getRatingValue).orElse(null);
        Long myRatingId = ratingOpt.map(EventRating::getId).orElse(null);
        boolean canRate = bookingRepository.existsByUserAndBusinessEventAndStatusIn(
            user,
            event,
            RATING_ELIGIBLE_STATUSES
        );
        return businessEventMapper.toResponse(event, myRating, myRatingId, canRate);
    }

    private static boolean canViewerSeeEvent(User viewer, BusinessEvent event) {
        if (!event.isHidden()) {
            return true;
        }
        if (isAdmin(viewer)) {
            return true;
        }
        return event.getBusinessProfile().getUser().getId().equals(viewer.getId());
    }

    private static boolean isAdmin(User user) {
        return user.getRoles().stream().anyMatch(r -> r.getName() == RoleName.ROLE_ADMIN);
    }

    private static int validateRating(Integer rating) {
        if (rating == null) {
            throw new BadRequestException("Rating is required");
        }
        if (rating < 1 || rating > 5) {
            throw new BadRequestException("Rating must be between 1 and 5");
        }
        return rating;
    }

    private static double roundAvg(double value) {
        if (!Double.isFinite(value)) {
            return 0.0;
        }
        return Math.round(value * 100.0) / 100.0;
    }
}
