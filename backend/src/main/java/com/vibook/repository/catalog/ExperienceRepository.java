package com.vibook.repository.catalog;

import com.vibook.entity.catalog.Experience;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Collection;
import java.util.List;
import java.util.Optional;

public interface ExperienceRepository extends JpaRepository<Experience, Long>, JpaSpecificationExecutor<Experience> {

    @Query("""
            SELECT x FROM Experience x
            JOIN FETCH x.category
            JOIN FETCH x.city
            WHERE x.id = :id
            """)
    Optional<Experience> findDetailById(@Param("id") Long id);

    @Query("""
            SELECT DISTINCT x FROM Experience x
            JOIN FETCH x.category
            JOIN FETCH x.city
            WHERE x.id IN :ids
            """)
    List<Experience> findListedByIds(@Param("ids") Collection<Long> ids);
}
