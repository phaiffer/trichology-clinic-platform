package com.phaiffer.clinic.modules.auth.infrastructure.persistence;

import com.phaiffer.clinic.modules.auth.domain.model.Role;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface RoleJpaRepository extends JpaRepository<Role, Long> {

    Optional<Role> findByName(String name);
}
