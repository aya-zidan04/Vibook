package com.vibook.backend.service;

import com.vibook.backend.dto.AdminEventRatingResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface AdminEventRatingModerationService {

    Page<AdminEventRatingResponse> list(Integer minRating, Boolean flaggedOnly, String search, Pageable pageable);

    void delete(Long id);

    AdminEventRatingResponse setHidden(Long id, boolean hidden);
}
