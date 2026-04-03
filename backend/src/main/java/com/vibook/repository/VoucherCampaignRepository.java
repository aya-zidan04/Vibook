package com.vibook.repository;

import com.vibook.entity.VoucherCampaign;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface VoucherCampaignRepository extends JpaRepository<VoucherCampaign, Long> {

    Optional<VoucherCampaign> findByCodeIgnoreCase(String code);
}
