package com.vibook.backend.mapper;

import com.vibook.backend.dto.EventRatingResponse;
import com.vibook.backend.entity.BusinessEvent;
import org.springframework.stereotype.Component;

@Component
public class EventRatingMapper {

    public EventRatingResponse toResponse(BusinessEvent event, Integer myRating, boolean canRate) {
        return new EventRatingResponse(
            event.getId(),
            event.getAverageRating(),
            event.getReviewCount(),
            myRating,
            canRate
        );
    }
}
