package com.vibook.backend.service;

import com.vibook.backend.dto.BusinessEventResponse;
import com.vibook.backend.dto.BusinessEventSummaryResponse;
import com.vibook.backend.dto.BusinessEventUpsertRequest;
import java.util.List;

public interface BusinessEventService {

    BusinessEventResponse create(BusinessEventUpsertRequest request);

    List<BusinessEventSummaryResponse> listMyBusinessEvents();

    BusinessEventResponse getByIdForOwnerOrAdmin(Long id);

    BusinessEventResponse update(Long id, BusinessEventUpsertRequest request);

    void delete(Long id);

    BusinessEventResponse hide(Long id);

    BusinessEventResponse unhide(Long id);
}
