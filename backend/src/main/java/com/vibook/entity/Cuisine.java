package com.vibook.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "cuisines")
public class Cuisine {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 64)
    private String slug;

    @Column(name = "label_en", nullable = false, length = 120)
    private String labelEn;

    @Column(name = "label_ar", nullable = false, length = 120)
    private String labelAr;

    @Column(length = 64)
    private String icon;

    protected Cuisine() {
    }

    public Long getId() {
        return id;
    }

    public String getSlug() {
        return slug;
    }

    public String getLabelEn() {
        return labelEn;
    }

    public String getLabelAr() {
        return labelAr;
    }

    public String getIcon() {
        return icon;
    }
}
