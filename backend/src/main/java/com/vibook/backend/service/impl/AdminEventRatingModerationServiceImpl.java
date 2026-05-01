package com.vibook.backend.service.impl;

import com.vibook.backend.dto.AdminEventRatingResponse;
import com.vibook.backend.entity.BusinessEvent;
import com.vibook.backend.entity.EventRating;
import com.vibook.backend.exception.NotFoundException;
import com.vibook.backend.repository.BusinessEventRepository;
import com.vibook.backend.repository.EventRatingRepository;
import com.vibook.backend.service.AdminEventRatingModerationService;
import com.vibook.backend.spec.AdminEventRatingSpecs;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AdminEventRatingModerationServiceImpl implements AdminEventRatingModerationService {

    private final EventRatingRepository eventRatingRepository;
    private final BusinessEventRepository businessEventRepository;

    public AdminEventRatingModerationServiceImpl(
        EventRatingRepository eventRatingRepository,
        BusinessEventRepository businessEventRepository
    ) {
        this.eventRatingRepository = eventRatingRepository;
        this.businessEventRepository = businessEventRepository;
    }

    @Override
    @Transactional(readOnly = true)
    public Page<AdminEventRatingResponse> list(Integer minRating, Boolean flaggedOnly, String search, Pageable pageable) {
        var spec = AdminEventRatingSpecs.withFilters(minRating, flaggedOnly, search);
        return eventRatingRepository.findAll(spec, pageable).map(this::toResponse);
    }

    @Override
    @Transactional
    public void delete(Long id) {
        EventRating rating = eventRatingRepository.findById(id).orElseThrow(() -> new NotFoundException("Rating not found"));
        Long eventId = rating.getBusinessEvent().getId();
        eventRatingRepository.delete(rating);
        refreshEventAggregates(eventId);
    }

    @Override
    @Transactional
    public AdminEventRatingResponse setHidden(Long id, boolean hidden) {
        EventRating rating = eventRatingRepository.findById(id).orElseThrow(() -> new NotFoundException("Rating not found"));
        rating.setModerationHidden(hidden);
        eventRatingRepository.save(rating);
        refreshEventAggregates(rating.getBusinessEvent().getId());
        return toResponse(rating);
    }

    private void refreshEventAggregates(Long eventId) {
        Object[] row = eventRatingRepository.averageAndCountVisible(eventId);
        double avg = row[0] instanceof Double d ? d : ((Number) row[0]).doubleValue();
        long count = row[1] instanceof Long l ? l : ((Number) row[1]).longValue();
        BusinessEvent ev = businessEventRepository.findById(eventId).orElseThrow(() -> new NotFoundException("Event not found"));
        ev.setAverageRating(roundAvg(avg));
        ev.setReviewCount((int) Math.min(Integer.MAX_VALUE, count));
        businessEventRepository.save(ev);
    }

    private static double roundAvg(double value) {
        if (!Double.isFinite(value)) {
            return 0.0;
        }
        return Math.round(value * 100.0) / 100.0;
    }

    private AdminEventRatingResponse toResponse(EventRating r) {
        var e = r.getBusinessEvent();
        var p = e.getBusinessProfile();
        return new AdminEventRatingResponse(
            r.getId(),
            r.getUser().getId(),
            r.getUser().getEmail(),
            e.getId(),
            e.getTitle(),
            p.getId(),
            p.getBusinessName(),
            r.getRatingValue(),
            r.isModerationHidden(),
            r.isFlagged(),
            r.getCreatedAt()
        );
    }
}
