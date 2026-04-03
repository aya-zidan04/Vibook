package com.vibook.repository.catalog;

import com.vibook.entity.catalog.TravelPackage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Collection;
import java.util.List;
import java.util.Optional;

public interface TravelPackageRepository extends JpaRepository<TravelPackage, Long>, JpaSpecificationExecutor<TravelPackage> {

    @Query("""
            SELECT DISTINCT p FROM TravelPackage p
            LEFT JOIN FETCH p.cities
            WHERE p.id = :id
            """)
    Optional<TravelPackage> findDetailById(@Param("id") Long id);

    @Query("""
            SELECT DISTINCT p FROM TravelPackage p
            LEFT JOIN FETCH p.cities
            WHERE p.id IN :ids
            """)
    List<TravelPackage> findListedByIds(@Param("ids") Collection<Long> ids);
}
