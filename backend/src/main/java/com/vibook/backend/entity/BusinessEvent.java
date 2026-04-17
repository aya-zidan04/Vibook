package com.vibook.backend.entity;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.OrderBy;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "business_events")
@Getter
@Setter
@NoArgsConstructor
public class BusinessEvent {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    @JoinColumn(name = "business_profile_id", nullable = false)
    private BusinessProfile businessProfile;

    /** Optional display title (mobile may send empty). */
    @Column(length = 255)
    private String title;

    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    @JoinColumn(name = "subcategory_id", nullable = false)
    private Subcategory subcategory;

    @Column(nullable = false, length = 4000)
    private String description;

    @Column(name = "event_date", nullable = false)
    private LocalDate eventDate;

    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    @JoinColumn(name = "governorate_id", nullable = false)
    private Governorate governorate;

    @Column(name = "google_maps_url", length = 512)
    private String googleMapsUrl;

    @Column(name = "price_jod", nullable = false, precision = 12, scale = 2)
    private BigDecimal priceJod;

    @Column(nullable = false, length = 8)
    private String currency = "JOD";

    @Column(name = "capacity_guests", nullable = false)
    private int capacityGuests;

    @Column(nullable = false)
    private boolean hidden;

    /** Rolling average of {@link EventRating#ratingValue} (incrementally maintained). */
    @Column(name = "average_rating", nullable = false)
    private double averageRating = 0.0;

    @Column(name = "review_count", nullable = false)
    private int reviewCount = 0;

    @OneToMany(mappedBy = "businessEvent", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("sortOrder ASC")
    private List<BusinessEventTimeSlot> timeSlots = new ArrayList<>();

    @OneToMany(mappedBy = "businessEvent", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("sortOrder ASC")
    private List<BusinessEventPhoto> photos = new ArrayList<>();

    @Column(nullable = false)
    private Instant createdAt;

    @Column(nullable = false)
    private Instant updatedAt;

    @PrePersist
    public void onCreate() {
        Instant now = Instant.now();
        this.createdAt = now;
        this.updatedAt = now;
    }

    @PreUpdate
    public void onUpdate() {
        this.updatedAt = Instant.now();
    }
}
