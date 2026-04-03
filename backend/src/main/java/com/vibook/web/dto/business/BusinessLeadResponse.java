package com.vibook.web.dto.business;

import com.vibook.entity.BusinessApplication;
import com.vibook.entity.enums.BusinessApplicationStatus;

import java.time.Instant;

public record BusinessLeadResponse(
        long id,
        String companyName,
        String email,
        String phone,
        String category,
        String message,
        BusinessApplicationStatus status,
        Instant createdAt,
        Instant updatedAt
) {
    public static BusinessLeadResponse fromEntity(BusinessApplication a) {
        return new BusinessLeadResponse(
                a.getId(),
                a.getCompanyName(),
                a.getEmail(),
                a.getPhone(),
                a.getCategory(),
                a.getMessage(),
                a.getStatus(),
                a.getCreatedAt(),
                a.getUpdatedAt()
        );
    }
}
