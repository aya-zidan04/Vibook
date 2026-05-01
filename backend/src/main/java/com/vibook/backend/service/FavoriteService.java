package com.vibook.backend.service;

import com.vibook.backend.dto.FavoriteEventResponse;
import com.vibook.backend.dto.FavoriteResponse;
import com.vibook.backend.dto.FavoriteStatusResponse;
import com.vibook.backend.dto.MessageResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface FavoriteService {

    FavoriteResponse addFavorite(Long eventId);

    MessageResponse removeFavorite(Long eventId);

    Page<FavoriteEventResponse> getMyFavorites(Pageable pageable);

    FavoriteStatusResponse getFavoriteStatus(Long eventId);
}
