package com.vibook.backend.service;

import com.vibook.backend.dto.BusinessEventSummaryResponse;
import java.math.BigDecimal;
import java.time.LocalDate;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface ConsumerEventService {

    Page<BusinessEventSummaryResponse> searchEvents(
        Long governorateId,
        Long categoryId,
        Long subcategoryId,
        LocalDate date,
        String keyword,
        BigDecimal minPrice,
        BigDecimal maxPrice,
        boolean includeHidden,
        boolean viewerIsAdmin,
        Pageable pageable
    );
}
