package com.vibook.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "cities")
public class City {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "name_en", nullable = false, length = 120)
    private String nameEn;

    @Column(name = "name_ar", nullable = false, length = 120)
    private String nameAr;

    @Column(nullable = false, length = 120)
    private String country;

    @Column(name = "image_url", length = 1024)
    private String imageUrl;

    protected City() {
    }

    public Long getId() {
        return id;
    }

    public String getNameEn() {
        return nameEn;
    }

    public String getNameAr() {
        return nameAr;
    }

    public String getCountry() {
        return country;
    }

    public String getImageUrl() {
        return imageUrl;
    }
}
