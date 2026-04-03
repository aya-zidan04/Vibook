package com.vibook.web.dto.catalog;

import com.vibook.entity.catalog.TicketTier;

import java.math.BigDecimal;
import java.util.List;

public record TicketTierResponse(
        long id,
        long eventId,
        String name,
        BigDecimal price,
        String currency,
        List<String> benefits,
        Integer remaining
) {
    public static TicketTierResponse fromEntity(TicketTier t) {
        return new TicketTierResponse(
                t.getId(),
                t.getEvent().getId(),
                t.getName(),
                t.getPrice(),
                t.getCurrency().name(),
                t.getBenefits() == null ? List.of() : List.copyOf(t.getBenefits()),
                t.getRemaining()
        );
    }
}
