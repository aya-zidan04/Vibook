package com.vibook.entity.catalog;

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
import jakarta.persistence.JoinTable;
import jakarta.persistence.ManyToMany;
import jakarta.persistence.Table;

import java.math.BigDecimal;
import java.util.LinkedHashSet;
import java.util.Set;

@Entity
@Table(name = "packages")
public class TravelPackage {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 500)
    private String title;

    @Column(name = "image_url", nullable = false, length = 1024)
    private String imageUrl;

    @Column(nullable = false)
    private int nights;

    @Column(name = "price_from", nullable = false, precision = 19, scale = 4)
    private BigDecimal priceFrom;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 3)
    private Currency currency;

    @Column(length = 32)
    private String badge;

    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(
            name = "package_cities",
            joinColumns = @JoinColumn(name = "package_id"),
            inverseJoinColumns = @JoinColumn(name = "city_id")
    )
    private Set<City> cities = new LinkedHashSet<>();

    protected TravelPackage() {
    }

    public Long getId() {
        return id;
    }

    public String getTitle() {
        return title;
    }

    public String getImageUrl() {
        return imageUrl;
    }

    public int getNights() {
        return nights;
    }

    public BigDecimal getPriceFrom() {
        return priceFrom;
    }

    public Currency getCurrency() {
        return currency;
    }

    public String getBadge() {
        return badge;
    }

    public Set<City> getCities() {
        return cities;
    }
}
