package com.vibook.backend.service;

import com.vibook.backend.dto.BusinessEventResponse;
import com.vibook.backend.dto.BusinessEventSummaryResponse;
import com.vibook.backend.dto.BusinessEventUpsertRequest;
import java.util.List;
import org.springframework.web.multipart.MultipartFile;

public interface BusinessEventService {

    BusinessEventResponse create(BusinessEventUpsertRequest request);

    List<BusinessEventSummaryResponse> listMyBusinessEvents();

    BusinessEventResponse getByIdForOwnerOrAdmin(Long id);

    BusinessEventResponse update(Long id, BusinessEventUpsertRequest request);

    void delete(Long id);

    BusinessEventResponse hide(Long id);

    BusinessEventResponse unhide(Long id);

    BusinessEventResponse uploadPhoto(Long eventId, MultipartFile image);

    BusinessEventResponse deletePhoto(Long eventId, Long photoId);
}
