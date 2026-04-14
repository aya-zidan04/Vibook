package com.vibook.backend.repository;

import com.vibook.backend.entity.Role;
import com.vibook.backend.entity.RoleName;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface RoleRepository extends JpaRepository<Role, Long> {
    Optional<Role> findByName(RoleName name);
}
