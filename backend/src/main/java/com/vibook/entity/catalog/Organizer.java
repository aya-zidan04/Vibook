package com.vibook.entity.catalog;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

import java.math.BigDecimal;

@Entity
@Table(name = "organizers")
public class Organizer {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 200)
    private String name;

    @Column(name = "logo_url", nullable = false, length = 1024)
    private String logoUrl;

    @Column(name = "cover_url", nullable = false, length = 1024)
    private String coverUrl;

    @Column(nullable = false)
    private boolean verified;

    @Column(nullable = false, columnDefinition = "text")
    private String about;

    @Column(nullable = false, precision = 4, scale = 2)
    private BigDecimal rating;

    @Column(name = "review_count", nullable = false)
    private int reviewCount;

    protected Organizer() {
    }

    public Long getId() {
        return id;
    }

    public String getName() {
        return name;
    }

    public String getLogoUrl() {
        return logoUrl;
    }

    public String getCoverUrl() {
        return coverUrl;
    }

    public boolean isVerified() {
        return verified;
    }

    public String getAbout() {
        return about;
    }

    public BigDecimal getRating() {
        return rating;
    }

    public int getReviewCount() {
        return reviewCount;
    }
}
