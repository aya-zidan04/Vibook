package com.vibook.backend.service;

import com.vibook.backend.dto.GovernorateRequest;
import com.vibook.backend.dto.GovernorateResponse;
import java.util.List;

public interface GovernorateService {

    GovernorateResponse createGovernorate(GovernorateRequest request);

    List<GovernorateResponse> getAllGovernorates();

    List<GovernorateResponse> getActiveGovernorates();

    GovernorateResponse getGovernorateById(Long id);

    GovernorateResponse updateGovernorate(Long id, GovernorateRequest request);

    void deleteGovernorate(Long id);
}
