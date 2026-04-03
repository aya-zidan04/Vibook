package com.vibook.repository.catalog;

import com.vibook.entity.catalog.TicketTier;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface TicketTierRepository extends JpaRepository<TicketTier, Long> {

    @EntityGraph(attributePaths = "benefits")
    List<TicketTier> findByEvent_IdOrderByPriceAsc(Long eventId);
}
