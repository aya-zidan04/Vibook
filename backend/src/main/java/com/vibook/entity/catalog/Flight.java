package com.vibook.entity.catalog;

import com.vibook.entity.enums.Currency;
import jakarta.persistence.Column;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

import java.math.BigDecimal;
import java.time.Instant;

@Entity
@Table(name = "flights")
public class Flight {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 200)
    private String airline;

    @Column(name = "from_code", nullable = false, length = 8)
    private String fromCode;

    @Column(name = "to_code", nullable = false, length = 8)
    private String toCode;

    @Column(name = "depart_at", nullable = false)
    private Instant departAt;

    @Column(name = "arrive_at", nullable = false)
    private Instant arriveAt;

    @Column(name = "duration_min", nullable = false)
    private int durationMin;

    @Column(nullable = false)
    private int stops;

    @Column(nullable = false, precision = 19, scale = 4)
    private BigDecimal price;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 3)
    private Currency currency;

    @Column(nullable = false, length = 16)
    private String cabin;

    protected Flight() {
    }

    public Long getId() {
        return id;
    }

    public String getAirline() {
        return airline;
    }

    public String getFromCode() {
        return fromCode;
    }

    public String getToCode() {
        return toCode;
    }

    public Instant getDepartAt() {
        return departAt;
    }

    public Instant getArriveAt() {
        return arriveAt;
    }

    public int getDurationMin() {
        return durationMin;
    }

    public int getStops() {
        return stops;
    }

    public BigDecimal getPrice() {
        return price;
    }

    public Currency getCurrency() {
        return currency;
    }

    public String getCabin() {
        return cabin;
    }
}
