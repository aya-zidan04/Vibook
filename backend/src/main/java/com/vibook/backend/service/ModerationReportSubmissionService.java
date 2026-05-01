package com.vibook.backend.service;

import com.vibook.backend.dto.CreateModerationReportRequest;
import com.vibook.backend.dto.ModerationReportCreatedResponse;
import com.vibook.backend.security.AuthenticatedUser;

public interface ModerationReportSubmissionService {

    ModerationReportCreatedResponse submit(AuthenticatedUser principal, CreateModerationReportRequest request);
}
