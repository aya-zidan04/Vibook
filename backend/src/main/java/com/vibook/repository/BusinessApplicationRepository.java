package com.vibook.repository;

import com.vibook.entity.BusinessApplication;
import org.springframework.data.jpa.repository.JpaRepository;

public interface BusinessApplicationRepository extends JpaRepository<BusinessApplication, Long> {
}
