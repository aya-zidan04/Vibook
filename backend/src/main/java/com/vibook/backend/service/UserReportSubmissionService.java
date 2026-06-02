package com.vibook.backend.service;

import com.vibook.backend.dto.CreateUserReportRequest;
import com.vibook.backend.dto.UserReportCreatedResponse;
import com.vibook.backend.security.AuthenticatedUser;

public interface UserReportSubmissionService {

    UserReportCreatedResponse submit(AuthenticatedUser principal, CreateUserReportRequest request);
}
