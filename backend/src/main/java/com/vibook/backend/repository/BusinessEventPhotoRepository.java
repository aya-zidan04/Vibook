package com.vibook.backend.repository;

import com.vibook.backend.entity.BusinessEventPhoto;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface BusinessEventPhotoRepository extends JpaRepository<BusinessEventPhoto, Long> {

    Optional<BusinessEventPhoto> findByIdAndBusinessEvent_Id(Long id, Long businessEventId);

    int countByBusinessEvent_Id(Long businessEventId);
}
