package com.vibook.repository.catalog;

import com.vibook.entity.catalog.Event;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Collection;
import java.util.List;
import java.util.Optional;

public interface EventRepository extends JpaRepository<Event, Long>, JpaSpecificationExecutor<Event> {

    @Query("""
            SELECT e FROM Event e
            JOIN FETCH e.category
            JOIN FETCH e.city
            JOIN FETCH e.organizer
            WHERE e.id = :id
            """)
    Optional<Event> findDetailById(@Param("id") Long id);

    @Query("""
            SELECT DISTINCT e FROM Event e
            JOIN FETCH e.category
            JOIN FETCH e.city
            JOIN FETCH e.organizer
            WHERE e.id IN :ids
            """)
    List<Event> findListedByIds(@Param("ids") Collection<Long> ids);
}
