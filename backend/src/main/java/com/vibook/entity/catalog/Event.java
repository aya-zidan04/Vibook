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
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "events")
public class Event {

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

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "organizer_id", nullable = false)
    private Organizer organizer;

    @Column(name = "image_url", nullable = false, length = 1024)
    private String imageUrl;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(nullable = false, columnDefinition = "jsonb")
    private List<String> gallery = new ArrayList<>();

    @Column(name = "start_at", nullable = false)
    private Instant startAt;

    @Column(name = "end_at", nullable = false)
    private Instant endAt;

    @Column(name = "venue_name", nullable = false, length = 300)
    private String venueName;

    @Column(nullable = false, columnDefinition = "text")
    private String address;

    @Column(nullable = false, columnDefinition = "text")
    private String description;

    @Column(name = "price_from", nullable = false, precision = 19, scale = 4)
    private BigDecimal priceFrom;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 3)
    private Currency currency;

    @Column(nullable = false, precision = 4, scale = 2)
    private BigDecimal rating;

    @Column(name = "review_count", nullable = false)
    private int reviewCount;

    @Column(length = 32)
    private String badge;

    protected Event() {
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

    public Organizer getOrganizer() {
        return organizer;
    }

    public String getImageUrl() {
        return imageUrl;
    }

    public List<String> getGallery() {
        return gallery;
    }

    public Instant getStartAt() {
        return startAt;
    }

    public Instant getEndAt() {
        return endAt;
    }

    public String getVenueName() {
        return venueName;
    }

    public String getAddress() {
        return address;
    }

    public String getDescription() {
        return description;
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

    public int getReviewCount() {
        return reviewCount;
    }

    public String getBadge() {
        return badge;
    }
}
