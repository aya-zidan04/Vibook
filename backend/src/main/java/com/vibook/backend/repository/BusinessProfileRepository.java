package com.vibook.backend.repository;

import com.vibook.backend.entity.BusinessProfile;
import com.vibook.backend.entity.User;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface BusinessProfileRepository extends JpaRepository<BusinessProfile, Long> {

    Optional<BusinessProfile> findByUser(User user);
}
