package com.vibook.backend.service;

import com.vibook.backend.dto.BusinessEventResponse;
import com.vibook.backend.dto.EventRatingResponse;
import com.vibook.backend.entity.BusinessEvent;

public interface EventRatingService {

    EventRatingResponse rateEvent(Long eventId, Integer rating, String userEmail);

    BusinessEventResponse getEventForViewer(Long eventId, String userEmail);

    BusinessEventResponse attachViewerRatingFields(BusinessEvent event, String userEmail);
}
