package com.vibook.entity;

import com.vibook.entity.enums.Currency;
import com.vibook.entity.enums.MembershipSubscriptionStatus;
import com.vibook.entity.enums.MembershipTier;
import com.vibook.entity.enums.PreferredLanguage;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EntityListeners;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.JoinTable;
import jakarta.persistence.ManyToMany;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.HashSet;
import java.util.Set;
import java.util.UUID;

@Entity
@Table(name = "users")
@EntityListeners(AuditingEntityListener.class)
public class User {

    @Id
    @Column(columnDefinition = "uuid")
    private UUID id;

    @Column(nullable = false, unique = true, length = 255)
    private String email;

    @Column(name = "password_hash", nullable = false)
    private String passwordHash;

    @Column(name = "first_name", nullable = false, length = 100)
    private String firstName;

    @Column(name = "last_name", nullable = false, length = 100)
    private String lastName;

    @Column(nullable = false, length = 32)
    private String phone;

    @Column(name = "name_ar", length = 200)
    private String nameAr;

    @Enumerated(EnumType.STRING)
    @Column(name = "preferred_language", nullable = false, length = 16)
    private PreferredLanguage preferredLanguage = PreferredLanguage.EN;

    @Column(name = "avatar_url", length = 1024)
    private String avatarUrl;

    @Enumerated(EnumType.STRING)
    @Column(name = "membership_tier", nullable = false, length = 32)
    private MembershipTier membershipTier = MembershipTier.STANDARD;

    @Column(name = "wallet_balance", nullable = false, precision = 19, scale = 4)
    private BigDecimal walletBalance = BigDecimal.ZERO;

    @Enumerated(EnumType.STRING)
    @Column(name = "wallet_currency", nullable = false, length = 3)
    private Currency walletCurrency = Currency.JOD;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "membership_plan_id")
    private MembershipPlan membershipPlan;

    @Column(name = "membership_subscribed_at")
    private Instant membershipSubscribedAt;

    @Column(name = "membership_renews_at")
    private Instant membershipRenewsAt;

    @Enumerated(EnumType.STRING)
    @Column(name = "membership_subscription_status", nullable = false, length = 32)
    private MembershipSubscriptionStatus membershipSubscriptionStatus = MembershipSubscriptionStatus.NONE;

    @Column(name = "membership_payment_reference", length = 255)
    private String membershipPaymentReference;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "city_id")
    private City city;

    @Column(nullable = false)
    private boolean enabled = true;

    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @LastModifiedDate
    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(
            name = "user_roles",
            joinColumns = @JoinColumn(name = "user_id"),
            inverseJoinColumns = @JoinColumn(name = "role_id")
    )
    private Set<Role> roles = new HashSet<>();

    @PrePersist
    void prePersist() {
        if (id == null) {
            id = UUID.randomUUID();
        }
    }

    public UUID getId() {
        return id;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPasswordHash() {
        return passwordHash;
    }

    public void setPasswordHash(String passwordHash) {
        this.passwordHash = passwordHash;
    }

    public String getFirstName() {
        return firstName;
    }

    public void setFirstName(String firstName) {
        this.firstName = firstName;
    }

    public String getLastName() {
        return lastName;
    }

    public void setLastName(String lastName) {
        this.lastName = lastName;
    }

    public String getPhone() {
        return phone;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }

    public String getNameAr() {
        return nameAr;
    }

    public void setNameAr(String nameAr) {
        this.nameAr = nameAr;
    }

    public PreferredLanguage getPreferredLanguage() {
        return preferredLanguage;
    }

    public void setPreferredLanguage(PreferredLanguage preferredLanguage) {
        this.preferredLanguage = preferredLanguage;
    }

    public String getAvatarUrl() {
        return avatarUrl;
    }

    public void setAvatarUrl(String avatarUrl) {
        this.avatarUrl = avatarUrl;
    }

    public MembershipTier getMembershipTier() {
        return membershipTier;
    }

    public void setMembershipTier(MembershipTier membershipTier) {
        this.membershipTier = membershipTier;
    }

    public BigDecimal getWalletBalance() {
        return walletBalance;
    }

    public void setWalletBalance(BigDecimal walletBalance) {
        this.walletBalance = walletBalance;
    }

    public Currency getWalletCurrency() {
        return walletCurrency;
    }

    public void setWalletCurrency(Currency walletCurrency) {
        this.walletCurrency = walletCurrency;
    }

    public MembershipPlan getMembershipPlan() {
        return membershipPlan;
    }

    public void setMembershipPlan(MembershipPlan membershipPlan) {
        this.membershipPlan = membershipPlan;
    }

    public Instant getMembershipSubscribedAt() {
        return membershipSubscribedAt;
    }

    public void setMembershipSubscribedAt(Instant membershipSubscribedAt) {
        this.membershipSubscribedAt = membershipSubscribedAt;
    }

    public Instant getMembershipRenewsAt() {
        return membershipRenewsAt;
    }

    public void setMembershipRenewsAt(Instant membershipRenewsAt) {
        this.membershipRenewsAt = membershipRenewsAt;
    }

    public MembershipSubscriptionStatus getMembershipSubscriptionStatus() {
        return membershipSubscriptionStatus;
    }

    public void setMembershipSubscriptionStatus(MembershipSubscriptionStatus membershipSubscriptionStatus) {
        this.membershipSubscriptionStatus = membershipSubscriptionStatus;
    }

    public String getMembershipPaymentReference() {
        return membershipPaymentReference;
    }

    public void setMembershipPaymentReference(String membershipPaymentReference) {
        this.membershipPaymentReference = membershipPaymentReference;
    }

    public City getCity() {
        return city;
    }

    public void setCity(City city) {
        this.city = city;
    }

    public Long getCityId() {
        return city != null ? city.getId() : null;
    }

    public boolean isEnabled() {
        return enabled;
    }

    public void setEnabled(boolean enabled) {
        this.enabled = enabled;
    }

    public Set<Role> getRoles() {
        return roles;
    }

    public void addRole(Role role) {
        roles.add(role);
    }
}
