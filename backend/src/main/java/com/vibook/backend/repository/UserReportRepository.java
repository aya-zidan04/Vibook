package com.vibook.backend.repository;

import com.vibook.backend.entity.UserReport;
import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface UserReportRepository extends JpaRepository<UserReport, Long> {

    @Query("SELECT r FROM UserReport r")
    Page<UserReport> findAllPaged(Pageable pageable);

    @Query("SELECT r FROM UserReport r JOIN FETCH r.user WHERE r.id = :id")
    Optional<UserReport> findDetailById(@Param("id") Long id);
}
