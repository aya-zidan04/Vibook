package com.vibook.repository;

import com.vibook.entity.Cuisine;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CuisineRepository extends JpaRepository<Cuisine, Long> {

    List<Cuisine> findAllByOrderByLabelEnAsc();
}
