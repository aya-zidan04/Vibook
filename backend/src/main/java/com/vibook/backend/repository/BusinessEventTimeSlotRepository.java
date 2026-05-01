package com.vibook.backend.repository;

import com.vibook.backend.entity.BusinessEventTimeSlot;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface BusinessEventTimeSlotRepository extends JpaRepository<BusinessEventTimeSlot, Long> {

    Optional<BusinessEventTimeSlot> findByIdAndBusinessEvent_Id(Long slotId, Long businessEventId);
}
