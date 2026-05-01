package com.vibook.backend.repository;

import com.vibook.backend.entity.BusinessProfile;
import com.vibook.backend.entity.BusinessProfileStatus;
import com.vibook.backend.entity.User;
import java.time.Instant;
import java.util.List;
import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;

public interface BusinessProfileRepository extends JpaRepository<BusinessProfile, Long>, JpaSpecificationExecutor<BusinessProfile> {

    Optional<BusinessProfile> findByUser(User user);

    long countByStatus(BusinessProfileStatus status);

    long countByPrimaryCategory_Id(Long categoryId);

    long countByGovernorate_Id(Long governorateId);

    List<BusinessProfile> findByCreatedAtGreaterThanEqual(Instant from);

    @Query(
        "select c.name, count(b) from BusinessProfile b join b.primaryCategory c group by c.id, c.name order by count(b) desc"
    )
    List<Object[]> countGroupedByCategoryName();

    @Query(
        "select g.name, count(b) from BusinessProfile b join b.governorate g group by g.id, g.name order by count(b) desc"
    )
    List<Object[]> countGroupedByGovernorateName();

    @Override
    Page<BusinessProfile> findAll(Pageable pageable);

    Page<BusinessProfile> findByStatus(BusinessProfileStatus status, Pageable pageable);

    @Override
    Optional<BusinessProfile> findById(Long id);
}
