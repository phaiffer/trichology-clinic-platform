package com.phaiffer.clinic.modules.patient.infrastructure.persistence;

import com.phaiffer.clinic.modules.patient.domain.model.Patient;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;
import java.util.UUID;

public interface PatientJpaRepository extends JpaRepository<Patient, UUID> {

    @Query("""
            select p
            from Patient p
            where lower(p.firstName) like lower(concat('%', :search, '%'))
               or lower(p.lastName) like lower(concat('%', :search, '%'))
               or lower(concat(p.firstName, ' ', p.lastName)) like lower(concat('%', :search, '%'))
            """)
    Page<Patient> search(@Param("search") String search, Pageable pageable);

    Optional<Patient> findByEmail(String email);
}
