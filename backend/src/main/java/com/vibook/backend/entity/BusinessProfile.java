package com.vibook.backend.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import java.time.Instant;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "business_profiles")
@Getter
@Setter
@NoArgsConstructor
public class BusinessProfile {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(optional = false, fetch = FetchType.EAGER)
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User user;

    @Column(nullable = false, length = 150)
    private String businessName;

    @Column(length = 255)
    private String tagline;

    /** Optional; public URL path under configured static file mapping. */
    @Column(length = 512)
    private String bannerImageUrl;

    /** Optional; public URL path under configured static file mapping. */
    @Column(length = 512)
    private String logoImageUrl;

    @ManyToOne(optional = false, fetch = FetchType.EAGER)
    @JoinColumn(name = "primary_category_id", nullable = false)
    private Category primaryCategory;

    @Column(length = 800)
    private String description;

    @Column(length = 120)
    private String workEmail;

    @Column(length = 30)
    private String phone;

    @ManyToOne(optional = false, fetch = FetchType.EAGER)
    @JoinColumn(name = "governorate_id", nullable = false)
    private Governorate governorate;

    @Column(length = 512)
    private String googleMapsUrl;

    @Column(length = 512)
    private String website;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 32)
    private BusinessProfileStatus status = BusinessProfileStatus.DRAFT;

    /** Set when an admin rejects the profile; cleared on resubmit / approve. */
    @Column(name = "rejection_reason", length = 500)
    private String rejectionReason;

    /** Internal admin notes; not shown to business owners in API responses unless included in admin DTOs. */
    @Column(name = "admin_notes", columnDefinition = "TEXT")
    private String adminNotes;

    private Instant approvedAt;

    private Instant rejectedAt;

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
