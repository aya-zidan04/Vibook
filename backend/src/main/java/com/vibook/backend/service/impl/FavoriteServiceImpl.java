package com.vibook.backend.service.impl;

import com.vibook.backend.dto.FavoriteEventResponse;
import com.vibook.backend.dto.FavoriteResponse;
import com.vibook.backend.dto.FavoriteStatusResponse;
import com.vibook.backend.dto.MessageResponse;
import com.vibook.backend.entity.BusinessEvent;
import com.vibook.backend.entity.Favorite;
import com.vibook.backend.entity.RoleName;
import com.vibook.backend.entity.User;
import com.vibook.backend.exception.ForbiddenException;
import com.vibook.backend.exception.ResourceNotFoundException;
import com.vibook.backend.exception.UnauthorizedException;
import com.vibook.backend.mapper.FavoriteMapper;
import com.vibook.backend.repository.BusinessEventRepository;
import com.vibook.backend.repository.FavoriteRepository;
import com.vibook.backend.repository.UserRepository;
import com.vibook.backend.security.AuthenticatedUser;
import com.vibook.backend.service.FavoriteService;
import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class FavoriteServiceImpl implements FavoriteService {

    private final FavoriteRepository favoriteRepository;
    private final BusinessEventRepository businessEventRepository;
    private final UserRepository userRepository;
    private final FavoriteMapper favoriteMapper;

    public FavoriteServiceImpl(
        FavoriteRepository favoriteRepository,
        BusinessEventRepository businessEventRepository,
        UserRepository userRepository,
        FavoriteMapper favoriteMapper
    ) {
        this.favoriteRepository = favoriteRepository;
        this.businessEventRepository = businessEventRepository;
        this.userRepository = userRepository;
        this.favoriteMapper = favoriteMapper;
    }

    @Override
    @Transactional
    public FavoriteResponse addFavorite(Long eventId) {
        User user = getCurrentAuthenticatedUser();
        BusinessEvent event = businessEventRepository
            .findWithDetailsById(eventId)
            .orElseThrow(() -> new ResourceNotFoundException("Event not found"));

        if (!canUserFavoriteEvent(user, event)) {
            if (event.isHidden()) {
                throw new ForbiddenException("You cannot add this event to favorites");
            }
            throw new ResourceNotFoundException("Event not found");
        }

        Optional<Favorite> existing = favoriteRepository.findByUserAndBusinessEvent(user, event);
        if (existing.isPresent()) {
            return favoriteMapper.toFavoriteResponse(existing.get());
        }

        Favorite favorite = new Favorite();
        favorite.setUser(user);
        favorite.setBusinessEvent(event);
        Favorite saved = favoriteRepository.save(favorite);
        return favoriteMapper.toFavoriteResponse(saved);
    }

    @Override
    @Transactional
    public MessageResponse removeFavorite(Long eventId) {
        User user = getCurrentAuthenticatedUser();
        BusinessEvent event = businessEventRepository
            .findById(eventId)
            .orElse(null);
        if (event == null) {
            return new MessageResponse("Removed from favorites");
        }
        favoriteRepository.deleteByUserAndBusinessEvent(user, event);
        return new MessageResponse("Removed from favorites");
    }

    @Override
    @Transactional(readOnly = true)
    public Page<FavoriteEventResponse> getMyFavorites(Pageable pageable) {
        User user = getCurrentAuthenticatedUser();
        return favoriteRepository.findConsumerVisibleByUserOrderByCreatedAtDesc(user, pageable).map(favoriteMapper::toFavoriteEventResponse);
    }

    @Override
    @Transactional(readOnly = true)
    public FavoriteStatusResponse getFavoriteStatus(Long eventId) {
        User user = getCurrentAuthenticatedUser();
        BusinessEvent event = businessEventRepository
            .findWithDetailsById(eventId)
            .orElseThrow(() -> new ResourceNotFoundException("Event not found"));
        if (!canUserFavoriteEvent(user, event)) {
            throw new ResourceNotFoundException("Event not found");
        }
        boolean favorited = favoriteRepository.existsByUserAndBusinessEvent(user, event);
        return new FavoriteStatusResponse(event.getId(), favorited);
    }

    /**
     * Same visibility as {@link com.vibook.backend.service.impl.EventRatingServiceImpl#getEventForViewer}:
     * public events for everyone; hidden only for admin or owning business user.
     */
    private static boolean canUserFavoriteEvent(User viewer, BusinessEvent event) {
        if (!event.isHidden()) {
            return true;
        }
        if (isAdmin(viewer)) {
            return true;
        }
        return event.getBusinessProfile().getUser().getId().equals(viewer.getId());
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
