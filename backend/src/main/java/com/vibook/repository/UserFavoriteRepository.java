package com.vibook.repository;

import com.vibook.entity.UserFavorite;
import com.vibook.entity.UserFavoriteId;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface UserFavoriteRepository extends JpaRepository<UserFavorite, UserFavoriteId> {

    List<UserFavorite> findByIdUserIdOrderByCreatedAtDesc(UUID userId);
}
