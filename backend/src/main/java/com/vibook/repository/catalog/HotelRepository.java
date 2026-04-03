package com.vibook.repository.catalog;

import com.vibook.entity.catalog.Hotel;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Collection;
import java.util.List;
import java.util.Optional;

public interface HotelRepository extends JpaRepository<Hotel, Long>, JpaSpecificationExecutor<Hotel> {

    @Query("""
            SELECT h FROM Hotel h
            JOIN FETCH h.city
            WHERE h.id = :id
            """)
    Optional<Hotel> findDetailById(@Param("id") Long id);

    @Query("""
            SELECT h FROM Hotel h
            JOIN FETCH h.city
            WHERE h.id IN :ids
            """)
    List<Hotel> findListedByIds(@Param("ids") Collection<Long> ids);
}
