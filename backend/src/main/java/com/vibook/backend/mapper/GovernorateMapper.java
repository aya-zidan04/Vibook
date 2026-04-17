package com.vibook.backend.mapper;

import com.vibook.backend.dto.GovernorateRequest;
import com.vibook.backend.dto.GovernorateResponse;
import com.vibook.backend.entity.Governorate;
import org.springframework.stereotype.Component;

@Component
public class GovernorateMapper {

    public GovernorateResponse toResponse(Governorate entity) {
        return new GovernorateResponse(
            entity.getId(),
            entity.getName(),
            entity.getDisplayOrder(),
            entity.isActive()
        );
    }

    public void applyRequest(Governorate entity, GovernorateRequest request) {
        entity.setName(request.name().trim());
        entity.setDisplayOrder(request.displayOrder());
        entity.setActive(Boolean.TRUE.equals(request.active()));
    }

    public Governorate newEntity(GovernorateRequest request) {
        Governorate g = new Governorate();
        applyRequest(g, request);
        return g;
    }
}
