package com.vibook.backend.repository;

import com.vibook.backend.entity.ModerationReport;
import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface ModerationReportRepository extends JpaRepository<ModerationReport, Long>, JpaSpecificationExecutor<ModerationReport> {

    @EntityGraph(attributePaths = { "reporter" })
    @Query("SELECT r FROM ModerationReport r")
    Page<ModerationReport> findAllPaged(Pageable pageable);

    @Query("SELECT r FROM ModerationReport r JOIN FETCH r.reporter WHERE r.id = :id")
    Optional<ModerationReport> findDetailById(@Param("id") Long id);
}
