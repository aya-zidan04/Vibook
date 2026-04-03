package com.vibook.web.dto.catalog;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.vibook.entity.catalog.Flight;

import java.math.BigDecimal;
import java.time.Instant;

public record FlightResponse(
        long id,
        String airline,
        @JsonProperty("from") String fromAirport,
        @JsonProperty("to") String toAirport,
        Instant departAt,
        Instant arriveAt,
        int durationMin,
        int stops,
        BigDecimal price,
        String currency,
        String cabin
) {
    public static FlightResponse fromEntity(Flight f) {
        return new FlightResponse(
                f.getId(),
                f.getAirline(),
                f.getFromCode(),
                f.getToCode(),
                f.getDepartAt(),
                f.getArriveAt(),
                f.getDurationMin(),
                f.getStops(),
                f.getPrice(),
                f.getCurrency().name(),
                f.getCabin()
        );
    }
}
