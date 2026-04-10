package com.phaiffer.clinic.modules.auth.infrastructure.persistence;

import com.phaiffer.clinic.modules.auth.domain.model.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface UserJpaRepository extends JpaRepository<User, Long> {

    Optional<User> findByEmail(String email);
}
