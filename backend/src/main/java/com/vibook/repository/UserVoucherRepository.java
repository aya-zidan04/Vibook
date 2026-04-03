package com.vibook.repository;

import com.vibook.entity.UserVoucher;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.UUID;

public interface UserVoucherRepository extends JpaRepository<UserVoucher, UUID> {

    @EntityGraph(attributePaths = "campaign")
    @Query("select uv from UserVoucher uv where uv.user.id = :userId order by uv.claimedAt desc")
    List<UserVoucher> findByUserIdOrderByClaimedAtDesc(@Param("userId") UUID userId);

    boolean existsByUser_IdAndCampaign_Id(UUID userId, Long campaignId);
}
