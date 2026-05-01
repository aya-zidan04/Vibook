package com.vibook.backend.service.impl;

import com.vibook.backend.dto.CreateModerationReportRequest;
import com.vibook.backend.dto.ModerationReportCreatedResponse;
import com.vibook.backend.entity.ModerationReport;
import com.vibook.backend.entity.ModerationReportStatus;
import com.vibook.backend.entity.ModerationReportType;
import com.vibook.backend.exception.BadRequestException;
import com.vibook.backend.exception.UnauthorizedException;
import com.vibook.backend.repository.BookingRepository;
import com.vibook.backend.repository.BusinessEventRepository;
import com.vibook.backend.repository.BusinessProfileRepository;
import com.vibook.backend.repository.EventRatingRepository;
import com.vibook.backend.repository.ModerationReportRepository;
import com.vibook.backend.repository.UserRepository;
import com.vibook.backend.security.AuthenticatedUser;
import com.vibook.backend.service.ModerationReportSubmissionService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

@Service
public class ModerationReportSubmissionServiceImpl implements ModerationReportSubmissionService {

    private final ModerationReportRepository moderationReportRepository;
    private final UserRepository userRepository;
    private final BusinessEventRepository businessEventRepository;
    private final BookingRepository bookingRepository;
    private final EventRatingRepository eventRatingRepository;
    private final BusinessProfileRepository businessProfileRepository;

    public ModerationReportSubmissionServiceImpl(
        ModerationReportRepository moderationReportRepository,
        UserRepository userRepository,
        BusinessEventRepository businessEventRepository,
        BookingRepository bookingRepository,
        EventRatingRepository eventRatingRepository,
        BusinessProfileRepository businessProfileRepository
    ) {
        this.moderationReportRepository = moderationReportRepository;
        this.userRepository = userRepository;
        this.businessEventRepository = businessEventRepository;
        this.bookingRepository = bookingRepository;
        this.eventRatingRepository = eventRatingRepository;
        this.businessProfileRepository = businessProfileRepository;
    }

    @Override
    @Transactional
    public ModerationReportCreatedResponse submit(AuthenticatedUser principal, CreateModerationReportRequest request) {
        if (principal == null) {
            throw new UnauthorizedException("Unauthorized");
        }
        ModerationReportType type = request.targetType();
        Long targetId = request.targetId();

        if (type != ModerationReportType.OTHER && targetId == null) {
            throw new BadRequestException("targetId is required for this report type");
        }

        assertTargetExists(type, targetId);

        var reporterRef = userRepository.getReferenceById(principal.getUser().getId());

        ModerationReport entity = new ModerationReport();
        entity.setReporter(reporterRef);
        entity.setType(type);
        entity.setTargetId(targetId);
        entity.setReason(request.reason().trim());
        entity.setDescription(blankToNull(request.description()));
        entity.setStatus(ModerationReportStatus.OPEN);

        ModerationReport saved = moderationReportRepository.save(entity);
        return new ModerationReportCreatedResponse(
            saved.getId(),
            saved.getType(),
            saved.getTargetId(),
            saved.getStatus(),
            saved.getCreatedAt()
        );
    }

    private void assertTargetExists(ModerationReportType type, Long targetId) {
        if (type == ModerationReportType.OTHER) {
            return;
        }
        switch (type) {
            case EVENT -> {
                if (!businessEventRepository.existsById(targetId)) {
                    throw new BadRequestException("Event not found");
                }
            }
            case BOOKING -> {
                if (!bookingRepository.existsById(targetId)) {
                    throw new BadRequestException("Booking not found");
                }
            }
            case USER -> {
                if (!userRepository.existsById(targetId)) {
                    throw new BadRequestException("User not found");
                }
            }
            case RATING -> {
                if (!eventRatingRepository.existsById(targetId)) {
                    throw new BadRequestException("Rating not found");
                }
            }
            case BUSINESS_PROFILE -> {
                if (!businessProfileRepository.existsById(targetId)) {
                    throw new BadRequestException("Business profile not found");
                }
            }
        }
    }

    private static String blankToNull(String value) {
        if (!StringUtils.hasText(value)) {
            return null;
        }
        String t = value.trim();
        return t.isEmpty() ? null : t;
    }
}
