package com.vibook.repository.catalog;

import com.vibook.entity.catalog.Restaurant;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Collection;
import java.util.List;
import java.util.Optional;

public interface RestaurantRepository extends JpaRepository<Restaurant, Long>, JpaSpecificationExecutor<Restaurant> {

    @Query("""
            SELECT DISTINCT r FROM Restaurant r
            LEFT JOIN FETCH r.cuisines
            LEFT JOIN FETCH r.city
            WHERE r.id = :id
            """)
    Optional<Restaurant> findDetailById(@Param("id") Long id);

    @Query("""
            SELECT DISTINCT r FROM Restaurant r
            JOIN FETCH r.city
            LEFT JOIN FETCH r.cuisines
            WHERE r.id IN :ids
            """)
    List<Restaurant> findListedByIds(@Param("ids") Collection<Long> ids);
}
