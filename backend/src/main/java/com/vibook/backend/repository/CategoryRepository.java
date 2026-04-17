package com.vibook.backend.repository;

import com.vibook.backend.entity.Category;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CategoryRepository extends JpaRepository<Category, Long> {

    List<Category> findAllByActiveIsTrueOrderByNameAsc();

    Optional<Category> findBySlugAndActiveIsTrue(String slug);
}
