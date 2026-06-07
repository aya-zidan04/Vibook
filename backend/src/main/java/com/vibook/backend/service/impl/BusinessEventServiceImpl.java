package com.vibook.backend.service.impl;

import com.vibook.backend.dto.BusinessEventResponse;
import com.vibook.backend.dto.BusinessEventSummaryResponse;
import com.vibook.backend.dto.BusinessEventUpsertRequest;
import com.vibook.backend.entity.BusinessEvent;
import com.vibook.backend.entity.BusinessEventPhoto;
import com.vibook.backend.entity.BusinessEventTimeSlot;
import com.vibook.backend.entity.BusinessProfile;
import com.vibook.backend.entity.BusinessProfileStatus;
import com.vibook.backend.entity.Governorate;
import com.vibook.backend.entity.RoleName;
import com.vibook.backend.entity.Subcategory;
import com.vibook.backend.entity.User;
import com.vibook.backend.exception.BadRequestException;
import com.vibook.backend.exception.ForbiddenException;
import com.vibook.backend.exception.NotFoundException;
import com.vibook.backend.exception.UnauthorizedException;
import com.vibook.backend.mapper.BusinessEventMapper;
import com.vibook.backend.repository.BusinessEventPhotoRepository;
import com.vibook.backend.repository.BusinessEventRepository;
import com.vibook.backend.repository.BusinessProfileRepository;
import com.vibook.backend.repository.GovernorateRepository;
import com.vibook.backend.repository.SubcategoryRepository;
import com.vibook.backend.repository.UserRepository;
import com.vibook.backend.security.AuthenticatedUser;
import com.vibook.backend.service.BusinessEventService;
import com.vibook.backend.service.EventRatingService;
import com.vibook.backend.service.ProfileImageStorageService;
import com.vibook.backend.util.BusinessEventValidation;
import com.vibook.backend.util.BusinessProfileAccessGuard;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

@Service
public class BusinessEventServiceImpl implements BusinessEventService {

    private final BusinessEventRepository businessEventRepository;
    private final BusinessEventPhotoRepository businessEventPhotoRepository;
    private final BusinessProfileRepository businessProfileRepository;
    private final SubcategoryRepository subcategoryRepository;
    private final GovernorateRepository governorateRepository;
    private final UserRepository userRepository;
    private final BusinessEventMapper businessEventMapper;
    private final EventRatingService eventRatingService;
    private final ProfileImageStorageService profileImageStorageService;

    public BusinessEventServiceImpl(
        BusinessEventRepository businessEventRepository,
        BusinessEventPhotoRepository businessEventPhotoRepository,
        BusinessProfileRepository businessProfileRepository,
        SubcategoryRepository subcategoryRepository,
        GovernorateRepository governorateRepository,
        UserRepository userRepository,
        BusinessEventMapper businessEventMapper,
        EventRatingService eventRatingService,
        ProfileImageStorageService profileImageStorageService
    ) {
        this.businessEventRepository = businessEventRepository;
        this.businessEventPhotoRepository = businessEventPhotoRepository;
        this.businessProfileRepository = businessProfileRepository;
        this.subcategoryRepository = subcategoryRepository;
        this.governorateRepository = governorateRepository;
        this.userRepository = userRepository;
        this.businessEventMapper = businessEventMapper;
        this.eventRatingService = eventRatingService;
        this.profileImageStorageService = profileImageStorageService;
    }

    @Override
    @Transactional
    public BusinessEventResponse create(BusinessEventUpsertRequest request) {
        User user = getCurrentAuthenticatedUser();
        BusinessProfile profile = businessProfileRepository
            .findByUser(user)
            .orElseThrow(() -> new NotFoundException("Business profile not found"));

        if (!isAdmin(user)) {
            BusinessProfileAccessGuard.requireApprovedForManagement(profile);
        }

        Subcategory subcategory = subcategoryRepository
            .findById(request.subcategoryId())
            .filter(Subcategory::isActive)
            .orElseThrow(() -> new NotFoundException("Category not found"));
        Governorate governorate = governorateRepository
            .findById(request.governorateId())
            .filter(Governorate::isActive)
            .orElseThrow(() -> new NotFoundException("Governorate not found"));

        List<String> slots = normalizeTimeSlots(request.timeSlots());
        if (slots.isEmpty()) {
            throw new BadRequestException("At least one time slot is required");
        }
        BusinessEventValidation.validateEventDateNotPast(request.eventDate());

        BusinessEvent event = new BusinessEvent();
        event.setBusinessProfile(profile);
        applyScalars(event, request, subcategory, governorate);
        replaceTimeSlots(event, slots);
        replacePhotos(event, request.photoUrls());
        validateEventState(event);

        BusinessEvent saved = businessEventRepository.save(event);
        BusinessEvent detailed = businessEventRepository.findWithDetailsById(saved.getId()).orElse(saved);
        return eventRatingService.attachViewerRatingFields(detailed, getCurrentAuthenticatedUser().getEmail());
    }

    @Override
    @Transactional(readOnly = true)
    public List<BusinessEventSummaryResponse> listMyBusinessEvents() {
        User user = getCurrentAuthenticatedUser();
        if (isAdmin(user)) {
            return businessEventRepository.findAllByOrderByCreatedAtDesc().stream()
                .map(businessEventMapper::toSummary)
                .toList();
        }
        BusinessProfile profile = businessProfileRepository
            .findByUser(user)
            .orElseThrow(() -> new NotFoundException("Business profile not found"));
        return businessEventRepository.findAllByBusinessProfileOrderByCreatedAtDesc(profile).stream()
            .map(businessEventMapper::toSummary)
            .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public BusinessEventResponse getByIdForOwnerOrAdmin(Long id) {
        BusinessEvent event = requireEventForAccess(id);
        return eventRatingService.attachViewerRatingFields(event, getCurrentAuthenticatedUser().getEmail());
    }

    @Override
    @Transactional
    public BusinessEventResponse update(Long id, BusinessEventUpsertRequest request) {
        BusinessEvent event = requireEventForMutation(id);

        Subcategory subcategory = subcategoryRepository
            .findById(request.subcategoryId())
            .filter(Subcategory::isActive)
            .orElseThrow(() -> new NotFoundException("Category not found"));
        Governorate governorate = governorateRepository
            .findById(request.governorateId())
            .filter(Governorate::isActive)
            .orElseThrow(() -> new NotFoundException("Governorate not found"));

        List<String> slots = normalizeTimeSlots(request.timeSlots());
        if (slots.isEmpty()) {
            throw new BadRequestException("At least one time slot is required");
        }
        BusinessEventValidation.validateEventDateNotPast(request.eventDate());

        applyScalars(event, request, subcategory, governorate);
        replaceTimeSlots(event, slots);
        replacePhotos(event, request.photoUrls());
        validateEventState(event);

        BusinessEvent saved = businessEventRepository.save(event);
        BusinessEvent detailed = businessEventRepository.findWithDetailsById(saved.getId()).orElse(saved);
        return eventRatingService.attachViewerRatingFields(detailed, getCurrentAuthenticatedUser().getEmail());
    }

    @Override
    @Transactional
    public void delete(Long id) {
        BusinessEvent event = requireEventForMutation(id);
        businessEventRepository.delete(event);
    }

    @Override
    @Transactional
    public BusinessEventResponse hide(Long id) {
        BusinessEvent event = requireEventForMutation(id);
        event.setHidden(true);
        BusinessEvent saved = businessEventRepository.save(event);
        BusinessEvent detailed = businessEventRepository.findWithDetailsById(saved.getId()).orElse(saved);
        return eventRatingService.attachViewerRatingFields(detailed, getCurrentAuthenticatedUser().getEmail());
    }

    @Override
    @Transactional
    public BusinessEventResponse unhide(Long id) {
        BusinessEvent event = requireEventForMutation(id);
        event.setHidden(false);
        BusinessEventValidation.validateVisibleEventHasPhotos(event);
        BusinessEvent saved = businessEventRepository.save(event);
        BusinessEvent detailed = businessEventRepository.findWithDetailsById(saved.getId()).orElse(saved);
        return eventRatingService.attachViewerRatingFields(detailed, getCurrentAuthenticatedUser().getEmail());
    }

    @Override
    @Transactional
    public BusinessEventResponse uploadPhoto(Long eventId, MultipartFile image) {
        BusinessEvent event = requireEventForMutation(eventId);
        if (event.getPhotos().size() >= BusinessEventValidation.MAX_PHOTOS) {
            throw new BadRequestException(
                "At most " + BusinessEventValidation.MAX_PHOTOS + " photos are allowed per event"
            );
        }
        String publicPath = profileImageStorageService.saveBusinessEventPhoto(image);
        int nextOrder =
            event.getPhotos().stream().map(BusinessEventPhoto::getSortOrder).max(Comparator.naturalOrder()).orElse(-1) + 1;
        BusinessEventPhoto photo = new BusinessEventPhoto();
        photo.setBusinessEvent(event);
        photo.setImageUrl(publicPath);
        photo.setSortOrder(nextOrder);
        event.getPhotos().add(photo);
        businessEventRepository.save(event);
        BusinessEvent detailed = businessEventRepository.findWithDetailsById(eventId).orElse(event);
        return eventRatingService.attachViewerRatingFields(detailed, getCurrentAuthenticatedUser().getEmail());
    }

    @Override
    @Transactional
    public BusinessEventResponse deletePhoto(Long eventId, Long photoId) {
        BusinessEvent event = requireEventForMutation(eventId);
        BusinessEventPhoto photo = businessEventPhotoRepository
            .findByIdAndBusinessEvent_Id(photoId, eventId)
            .orElseThrow(() -> new NotFoundException("Event photo not found"));
        profileImageStorageService.tryDeleteStoredFile(photo.getImageUrl());
        event.getPhotos().remove(photo);
        businessEventRepository.save(event);
        BusinessEvent detailed = businessEventRepository.findWithDetailsById(eventId).orElse(event);
        return eventRatingService.attachViewerRatingFields(detailed, getCurrentAuthenticatedUser().getEmail());
    }

    private BusinessEvent requireEventForAccess(Long id) {
        User user = getCurrentAuthenticatedUser();
        BusinessEvent event = businessEventRepository
            .findWithDetailsById(id)
            .orElseThrow(() -> new NotFoundException("Event not found"));
        if (isAdmin(user)) {
            return event;
        }
        BusinessProfile profile = businessProfileRepository
            .findByUser(user)
            .orElseThrow(() -> new NotFoundException("Business profile not found"));
        if (!event.getBusinessProfile().getId().equals(profile.getId())) {
            throw new AccessDeniedException("You do not have access to this event");
        }
        return event;
    }

    private BusinessEvent requireEventForMutation(Long id) {
        BusinessEvent event = requireEventForAccess(id);
        if (!isAdmin(getCurrentAuthenticatedUser())) {
            BusinessProfileAccessGuard.requireApprovedForManagement(event.getBusinessProfile());
        }
        return event;
    }

    private void applyScalars(
        BusinessEvent entity,
        BusinessEventUpsertRequest request,
        Subcategory subcategory,
        Governorate governorate
    ) {
        entity.setTitle(request.title().trim());
        entity.setSubcategory(subcategory);
        entity.setDescription(request.description().trim());
        entity.setEventDate(request.eventDate());
        entity.setGovernorate(governorate);
        entity.setGoogleMapsUrl(blankToNull(request.googleMapsUrl()));
        entity.setPriceJod(request.priceJod());
        String currency = StringUtils.hasText(request.currency()) ? request.currency().trim().toUpperCase() : "JOD";
        entity.setCurrency(currency);
        entity.setCapacityGuests(request.capacityGuests());
        entity.setHidden(Boolean.TRUE.equals(request.hidden()));
    }

    private static void replaceTimeSlots(BusinessEvent event, List<String> labels) {
        event.getTimeSlots().clear();
        int order = 0;
        for (String label : labels) {
            BusinessEventTimeSlot slot = new BusinessEventTimeSlot();
            slot.setBusinessEvent(event);
            slot.setSlotLabel(label);
            slot.setSortOrder(order++);
            event.getTimeSlots().add(slot);
        }
    }

    private static void replacePhotos(BusinessEvent event, List<String> photoUrls) {
        if (photoUrls == null) {
            return;
        }
        event.getPhotos().clear();
        if (photoUrls.isEmpty()) {
            return;
        }
        int order = 0;
        for (String raw : photoUrls) {
            if (!StringUtils.hasText(raw)) {
                continue;
            }
            String trimmed = raw.trim();
            if (trimmed.startsWith("file:")) {
                continue;
            }
            BusinessEventPhoto photo = new BusinessEventPhoto();
            photo.setBusinessEvent(event);
            photo.setImageUrl(trimmed);
            photo.setSortOrder(order++);
            event.getPhotos().add(photo);
        }
        BusinessEventValidation.validatePhotoCount(event.getPhotos().size());
    }

    private static void validateEventState(BusinessEvent event) {
        BusinessEventValidation.validatePhotoCount(event.getPhotos().size());
        BusinessEventValidation.validateVisibleEventHasPhotos(event);
    }

    private static List<String> normalizeTimeSlots(List<String> raw) {
        List<String> out = new ArrayList<>();
        for (String s : raw) {
            if (s == null) {
                continue;
            }
            String t = s.trim();
            if (!t.isEmpty()) {
                out.add(t);
            }
        }
        return out;
    }

    private static String blankToNull(String value) {
        if (!StringUtils.hasText(value)) {
            return null;
        }
        String t = value.trim();
        return t.isEmpty() ? null : t;
    }

    private static boolean isAdmin(User user) {
        return user.getRoles().stream().anyMatch(r -> r.getName() == RoleName.ROLE_ADMIN);
    }

    private User getCurrentAuthenticatedUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !(authentication.getPrincipal() instanceof AuthenticatedUser principal)) {
            throw new UnauthorizedException("Unauthorized");
        }
        return userRepository
            .findByEmail(principal.getUsername())
            .orElseThrow(() -> new UnauthorizedException("Unauthorized"));
    }
}
