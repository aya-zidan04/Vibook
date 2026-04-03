package com.vibook.entity.catalog;

import com.vibook.entity.Category;
import com.vibook.entity.City;
import com.vibook.entity.enums.Currency;
import jakarta.persistence.Column;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

import java.math.BigDecimal;

@Entity
@Table(name = "experiences")
public class Experience {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 500)
    private String title;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "category_id", nullable = false)
    private Category category;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "city_id", nullable = false)
    private City city;

    @Column(name = "image_url", nullable = false, length = 1024)
    private String imageUrl;

    @Column(name = "duration_hours", nullable = false, precision = 6, scale = 2)
    private BigDecimal durationHours;

    @Column(name = "price_from", nullable = false, precision = 19, scale = 4)
    private BigDecimal priceFrom;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 3)
    private Currency currency;

    @Column(nullable = false, precision = 4, scale = 2)
    private BigDecimal rating;

    @Column(length = 32)
    private String badge;

    protected Experience() {
    }

    public Long getId() {
        return id;
    }

    public String getTitle() {
        return title;
    }

    public Category getCategory() {
        return category;
    }

    public City getCity() {
        return city;
    }

    public String getImageUrl() {
        return imageUrl;
    }

    public BigDecimal getDurationHours() {
        return durationHours;
    }

    public BigDecimal getPriceFrom() {
        return priceFrom;
    }

    public Currency getCurrency() {
        return currency;
    }

    public BigDecimal getRating() {
        return rating;
    }

    public String getBadge() {
        return badge;
    }
}
