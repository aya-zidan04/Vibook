package com.vibook.backend.service.impl;

import com.vibook.backend.dto.BusinessEventSummaryResponse;
import com.vibook.backend.entity.BusinessEvent;
import com.vibook.backend.mapper.BusinessEventMapper;
import com.vibook.backend.repository.BusinessEventRepository;
import com.vibook.backend.service.ConsumerEventService;
import com.vibook.backend.spec.BusinessEventSpecifications;
import java.math.BigDecimal;
import java.time.LocalDate;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class ConsumerEventServiceImpl implements ConsumerEventService {

    private final BusinessEventRepository businessEventRepository;
    private final BusinessEventMapper businessEventMapper;

    public ConsumerEventServiceImpl(BusinessEventRepository businessEventRepository, BusinessEventMapper businessEventMapper) {
        this.businessEventRepository = businessEventRepository;
        this.businessEventMapper = businessEventMapper;
    }

    @Override
    @Transactional(readOnly = true)
    public Page<BusinessEventSummaryResponse> searchEvents(
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
    ) {
        Specification<BusinessEvent> spec = BusinessEventSpecifications.visibleForViewer(includeHidden, viewerIsAdmin);
        spec = BusinessEventSpecifications.combine(spec, BusinessEventSpecifications.governorateIdEquals(governorateId));
        spec = BusinessEventSpecifications.combine(spec, BusinessEventSpecifications.categoryIdEquals(categoryId));
        spec = BusinessEventSpecifications.combine(spec, BusinessEventSpecifications.subcategoryIdEquals(subcategoryId));
        spec = BusinessEventSpecifications.combine(spec, BusinessEventSpecifications.eventDateEquals(date));
        spec = BusinessEventSpecifications.combine(spec, BusinessEventSpecifications.keywordContains(keyword));
        spec = BusinessEventSpecifications.combine(spec, BusinessEventSpecifications.minPriceAtLeast(minPrice));
        spec = BusinessEventSpecifications.combine(spec, BusinessEventSpecifications.maxPriceAtMost(maxPrice));

        return businessEventRepository.findAll(spec, pageable).map(businessEventMapper::toSummary);
    }
}
