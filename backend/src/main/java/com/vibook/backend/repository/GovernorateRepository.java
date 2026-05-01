package com.vibook.backend.repository;

import com.vibook.backend.entity.Governorate;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

public interface GovernorateRepository extends JpaRepository<Governorate, Long> {

    boolean existsByName(String name);

    Optional<Governorate> findByName(String name);

    List<Governorate> findAllByActiveTrueOrderByDisplayOrderAscNameAsc();

    List<Governorate> findAllByOrderByDisplayOrderAscNameAsc();

    @Query(
        "select g.id, g.name, g.displayOrder, g.active, count(b) from Governorate g left join BusinessProfile b on b.governorate.id = g.id group by g.id, g.name, g.displayOrder, g.active order by g.displayOrder asc, g.name asc"
    )
    List<Object[]> summarizeWithBusinessCounts();
}
