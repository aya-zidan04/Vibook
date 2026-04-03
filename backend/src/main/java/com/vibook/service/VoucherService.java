package com.vibook.service;

import com.vibook.entity.User;
import com.vibook.entity.UserVoucher;
import com.vibook.entity.VoucherCampaign;
import com.vibook.repository.UserRepository;
import com.vibook.repository.UserVoucherRepository;
import com.vibook.repository.VoucherCampaignRepository;
import com.vibook.web.dto.voucher.RedeemVoucherRequest;
import com.vibook.web.dto.voucher.VoucherResponse;
import com.vibook.web.dto.voucher.VouchersListResponse;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.Instant;
import java.util.UUID;

@Service
public class VoucherService {

    private final UserVoucherRepository userVoucherRepository;
    private final VoucherCampaignRepository voucherCampaignRepository;
    private final UserRepository userRepository;

    public VoucherService(
            UserVoucherRepository userVoucherRepository,
            VoucherCampaignRepository voucherCampaignRepository,
            UserRepository userRepository
    ) {
        this.userVoucherRepository = userVoucherRepository;
        this.voucherCampaignRepository = voucherCampaignRepository;
        this.userRepository = userRepository;
    }

    @Transactional(readOnly = true)
    public VouchersListResponse listVouchers(UUID userId) {
        var list = userVoucherRepository.findByUserIdOrderByClaimedAtDesc(userId).stream()
                .map(VoucherResponse::fromEntity)
                .toList();
        return new VouchersListResponse(list);
    }

    @Transactional
    public VoucherResponse redeem(UUID userId, RedeemVoucherRequest request) {
        String code = request.code().trim();
        if (code.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Voucher code is required");
        }
        VoucherCampaign campaign = voucherCampaignRepository.findByCodeIgnoreCase(code)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Invalid voucher code"));
        if (!campaign.isActive()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "This voucher is no longer active");
        }
        if (campaign.getExpiresAt().isBefore(Instant.now())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Voucher has expired");
        }
        if (userVoucherRepository.existsByUser_IdAndCampaign_Id(userId, campaign.getId())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Voucher already redeemed");
        }
        User user = userRepository.getReferenceById(userId);
        UserVoucher uv = new UserVoucher();
        uv.setUser(user);
        uv.setCampaign(campaign);
        uv.setClaimedAt(Instant.now());
        return VoucherResponse.fromEntity(userVoucherRepository.save(uv));
    }
}
