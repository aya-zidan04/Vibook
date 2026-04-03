package com.vibook.service;

import com.vibook.repository.UserRepository;
import com.vibook.web.dto.wallet.WalletResponse;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.UUID;

/**
 * Read-only wallet view backed by {@link com.vibook.entity.User} balance/currency.
 * No transaction ledger in this phase — avoids complexity until top-ups and payouts are defined.
 */
@Service
public class WalletService {

    private final UserRepository userRepository;

    public WalletService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Transactional(readOnly = true)
    public WalletResponse getWallet(UUID userId) {
        return userRepository.findById(userId)
                .map(WalletResponse::fromUser)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
    }
}
