package com.vibook.entity.catalog;

import com.vibook.entity.enums.Currency;
import jakarta.persistence.CollectionTable;
import jakarta.persistence.Column;
import jakarta.persistence.ElementCollection;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OrderColumn;
import jakarta.persistence.Table;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "ticket_tiers")
public class TicketTier {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "event_id", nullable = false)
    private Event event;

    @Column(nullable = false, length = 200)
    private String name;

    @Column(nullable = false, precision = 19, scale = 4)
    private BigDecimal price;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 3)
    private Currency currency;

    private Integer remaining;

    @ElementCollection
    @CollectionTable(name = "ticket_tier_benefits", joinColumns = @JoinColumn(name = "tier_id"))
    @OrderColumn(name = "sort_index")
    @Column(name = "benefit", length = 500)
    private List<String> benefits = new ArrayList<>();

    protected TicketTier() {
    }

    public Long getId() {
        return id;
    }

    public Event getEvent() {
        return event;
    }

    public String getName() {
        return name;
    }

    public BigDecimal getPrice() {
        return price;
    }

    public Currency getCurrency() {
        return currency;
    }

    public Integer getRemaining() {
        return remaining;
    }

    public List<String> getBenefits() {
        return benefits;
    }
}
