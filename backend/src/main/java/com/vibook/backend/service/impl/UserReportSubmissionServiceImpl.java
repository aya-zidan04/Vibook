package com.vibook.backend.service.impl;

import com.vibook.backend.dto.CreateUserReportRequest;
import com.vibook.backend.dto.UserReportCreatedResponse;
import com.vibook.backend.entity.UserReport;
import com.vibook.backend.entity.UserReportStatus;
import com.vibook.backend.exception.UnauthorizedException;
import com.vibook.backend.repository.UserReportRepository;
import com.vibook.backend.repository.UserRepository;
import com.vibook.backend.security.AuthenticatedUser;
import com.vibook.backend.service.UserReportSubmissionService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class UserReportSubmissionServiceImpl implements UserReportSubmissionService {

    private final UserReportRepository userReportRepository;
    private final UserRepository userRepository;

    public UserReportSubmissionServiceImpl(UserReportRepository userReportRepository, UserRepository userRepository) {
        this.userReportRepository = userReportRepository;
        this.userRepository = userRepository;
    }

    @Override
    @Transactional
    public UserReportCreatedResponse submit(AuthenticatedUser principal, CreateUserReportRequest request) {
        if (principal == null) {
            throw new UnauthorizedException("Unauthorized");
        }

        var userRef = userRepository.getReferenceById(principal.getUser().getId());

        UserReport entity = new UserReport();
        entity.setUser(userRef);
        entity.setSubject(request.subject().trim());
        entity.setMessage(request.message().trim());
        entity.setStatus(UserReportStatus.OPEN);

        UserReport saved = userReportRepository.save(entity);
        return new UserReportCreatedResponse(saved.getId(), saved.getStatus(), saved.getCreatedAt());
    }
}
