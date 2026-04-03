package com.vibook.entity.catalog;

import com.vibook.entity.City;
import com.vibook.entity.Cuisine;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.JoinTable;
import jakarta.persistence.ManyToMany;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

import java.math.BigDecimal;
import java.util.LinkedHashSet;
import java.util.Set;

@Entity
@Table(name = "restaurants")
public class Restaurant {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 300)
    private String name;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "city_id", nullable = false)
    private City city;

    @Column(name = "image_url", nullable = false, length = 1024)
    private String imageUrl;

    @Column(name = "price_level", nullable = false)
    private int priceLevel;

    @Column(nullable = false, precision = 4, scale = 2)
    private BigDecimal rating;

    @Column(name = "review_count", nullable = false)
    private int reviewCount;

    @Column(length = 32)
    private String badge;

    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(
            name = "restaurant_cuisines",
            joinColumns = @JoinColumn(name = "restaurant_id"),
            inverseJoinColumns = @JoinColumn(name = "cuisine_id")
    )
    private Set<Cuisine> cuisines = new LinkedHashSet<>();

    protected Restaurant() {
    }

    public Long getId() {
        return id;
    }

    public String getName() {
        return name;
    }

    public City getCity() {
        return city;
    }

    public String getImageUrl() {
        return imageUrl;
    }

    public int getPriceLevel() {
        return priceLevel;
    }

    public BigDecimal getRating() {
        return rating;
    }

    public int getReviewCount() {
        return reviewCount;
    }

    public String getBadge() {
        return badge;
    }

    public Set<Cuisine> getCuisines() {
        return cuisines;
    }
}
