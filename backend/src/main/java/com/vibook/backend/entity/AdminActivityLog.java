package com.vibook.backend.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import java.time.Instant;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "admin_activity_logs")
@Getter
@Setter
@NoArgsConstructor
public class AdminActivityLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long adminUserId;

    @Column(nullable = false, length = 120)
    private String adminEmail;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 48)
    private AdminActivityAction action;

    /** e.g. BUSINESS_PROFILE, USER, CATEGORY */
    @Column(nullable = false, length = 40)
    private String entityType;

    @Column(nullable = false)
    private Long entityId;

    @Column(length = 2000)
    private String details;

    @Column(nullable = false)
    private Instant createdAt;

    @PrePersist
    public void onCreate() {
        if (createdAt == null) {
            createdAt = Instant.now();
        }
    }
}
