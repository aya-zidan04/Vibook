package com.vibook.repository;

import com.vibook.entity.MembershipPlan;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface MembershipPlanRepository extends JpaRepository<MembershipPlan, Long> {

    List<MembershipPlan> findByActiveTrueOrderBySortIndexAsc();

    Optional<MembershipPlan> findByIdAndActiveTrue(Long id);
}
