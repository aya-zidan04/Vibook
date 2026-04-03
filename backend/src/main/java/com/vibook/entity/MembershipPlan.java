package com.vibook.entity;

import com.vibook.entity.enums.Currency;
import com.vibook.entity.enums.MembershipTier;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "membership_plans")
public class MembershipPlan {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 64)
    private String code;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 32)
    private MembershipTier tier;

    @Column(name = "name_en", nullable = false, length = 200)
    private String nameEn;

    @Column(name = "name_ar", length = 200)
    private String nameAr;

    @Column(name = "price_monthly", nullable = false, precision = 19, scale = 4)
    private BigDecimal priceMonthly = BigDecimal.ZERO;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 3)
    private Currency currency;

    @Column(nullable = false)
    private boolean recommended;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(nullable = false, columnDefinition = "jsonb")
    private List<String> benefits = new ArrayList<>();

    @Column(nullable = false)
    private boolean active = true;

    @Column(name = "sort_index", nullable = false)
    private int sortIndex;

    protected MembershipPlan() {
    }

    public Long getId() {
        return id;
    }

    public String getCode() {
        return code;
    }

    public MembershipTier getTier() {
        return tier;
    }

    public String getNameEn() {
        return nameEn;
    }

    public String getNameAr() {
        return nameAr;
    }

    public BigDecimal getPriceMonthly() {
        return priceMonthly;
    }

    public Currency getCurrency() {
        return currency;
    }

    public boolean isRecommended() {
        return recommended;
    }

    public List<String> getBenefits() {
        return benefits;
    }

    public boolean isActive() {
        return active;
    }

    public int getSortIndex() {
        return sortIndex;
    }
}
