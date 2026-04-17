package com.vibook.backend.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "business_event_time_slots")
@Getter
@Setter
@NoArgsConstructor
public class BusinessEventTimeSlot {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    @JoinColumn(name = "business_event_id", nullable = false)
    private BusinessEvent businessEvent;

    /** Canonical label, e.g. {@code 05:30 PM} (aligned with client slot list). */
    @Column(name = "slot_label", nullable = false, length = 32)
    private String slotLabel;

    @Column(name = "sort_order", nullable = false)
    private int sortOrder;
}
