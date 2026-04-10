package com.phaiffer.clinic.modules.auth.infrastructure.security;

import com.phaiffer.clinic.modules.auth.infrastructure.persistence.UserJpaRepository;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.Locale;

@Service
public class ClinicUserDetailsService implements UserDetailsService {

    private final UserJpaRepository userJpaRepository;

    public ClinicUserDetailsService(UserJpaRepository userJpaRepository) {
        this.userJpaRepository = userJpaRepository;
    }

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        String normalizedEmail = username == null ? "" : username.trim().toLowerCase(Locale.ROOT);

        return userJpaRepository.findByEmail(normalizedEmail)
                .map(ClinicUserPrincipal::new)
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));
    }
}
