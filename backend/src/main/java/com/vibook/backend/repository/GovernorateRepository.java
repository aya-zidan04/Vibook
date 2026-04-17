package com.vibook.backend.repository;

import com.vibook.backend.entity.Governorate;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface GovernorateRepository extends JpaRepository<Governorate, Long> {

    boolean existsByName(String name);

    Optional<Governorate> findByName(String name);

    List<Governorate> findAllByActiveTrueOrderByDisplayOrderAscNameAsc();

    List<Governorate> findAllByOrderByDisplayOrderAscNameAsc();
}
