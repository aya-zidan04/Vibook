package com.vibook.service;

import com.vibook.entity.BusinessApplication;
import com.vibook.entity.enums.BusinessApplicationStatus;
import com.vibook.repository.BusinessApplicationRepository;
import com.vibook.web.dto.business.BusinessLeadResponse;
import com.vibook.web.dto.business.CreateBusinessLeadRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class BusinessLeadService {

    private final BusinessApplicationRepository businessApplicationRepository;

    public BusinessLeadService(BusinessApplicationRepository businessApplicationRepository) {
        this.businessApplicationRepository = businessApplicationRepository;
    }

    @Transactional
    public BusinessLeadResponse submitLead(CreateBusinessLeadRequest request) {
        BusinessApplication app = new BusinessApplication();
        app.setCompanyName(request.companyName().trim());
        app.setEmail(request.email().trim().toLowerCase());
        app.setPhone(request.phone().trim());
        app.setCategory(request.category().trim());
        app.setMessage(request.message().trim());
        app.setStatus(BusinessApplicationStatus.PENDING);
        return BusinessLeadResponse.fromEntity(businessApplicationRepository.save(app));
    }
}
