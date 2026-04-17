package com.vibook.backend.repository;

import com.vibook.backend.entity.Subcategory;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface SubcategoryRepository extends JpaRepository<Subcategory, Long> {

    List<Subcategory> findAllByCategory_IdAndActiveIsTrueOrderByNameAsc(Long categoryId);
}
