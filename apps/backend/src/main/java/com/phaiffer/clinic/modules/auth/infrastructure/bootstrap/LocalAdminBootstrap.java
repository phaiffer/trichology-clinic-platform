package com.phaiffer.clinic.modules.auth.infrastructure.bootstrap;

import com.phaiffer.clinic.modules.auth.domain.model.Role;
import com.phaiffer.clinic.modules.auth.domain.model.RoleNames;
import com.phaiffer.clinic.modules.auth.domain.model.User;
import com.phaiffer.clinic.modules.auth.infrastructure.persistence.RoleJpaRepository;
import com.phaiffer.clinic.modules.auth.infrastructure.persistence.UserJpaRepository;
import jakarta.transaction.Transactional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.HashSet;
import java.util.Locale;
import java.util.Set;

@Component
@EnableConfigurationProperties(LocalAdminBootstrapProperties.class)
public class LocalAdminBootstrap implements ApplicationRunner {

    private static final Logger LOGGER = LoggerFactory.getLogger(LocalAdminBootstrap.class);

    private final LocalAdminBootstrapProperties properties;
    private final UserJpaRepository userJpaRepository;
    private final RoleJpaRepository roleJpaRepository;
    private final PasswordEncoder passwordEncoder;

    public LocalAdminBootstrap(
            LocalAdminBootstrapProperties properties,
            UserJpaRepository userJpaRepository,
            RoleJpaRepository roleJpaRepository,
            PasswordEncoder passwordEncoder
    ) {
        this.properties = properties;
        this.userJpaRepository = userJpaRepository;
        this.roleJpaRepository = roleJpaRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    @Transactional
    public void run(ApplicationArguments args) {
        String email = normalize(properties.getBootstrapAdminEmail());
        String password = properties.getBootstrapAdminPassword() == null
                ? ""
                : properties.getBootstrapAdminPassword().trim();

        if (email.isBlank() || password.isBlank()) {
            LOGGER.info("Local admin bootstrap skipped because bootstrap credentials were not configured");
            return;
        }

        Role adminRole = roleJpaRepository.findByName(RoleNames.ADMIN)
                .orElseThrow(() -> new IllegalStateException("Required role not found: " + RoleNames.ADMIN));

        User user = userJpaRepository.findByEmail(email).orElseGet(User::new);
        Set<Role> roles = new HashSet<>(user.getRoles());
        roles.add(adminRole);

        user.setEmail(email);
        user.setFullName(normalizeFullName(properties.getBootstrapAdminFullName()));
        user.setPasswordHash(passwordEncoder.encode(password));
        user.setActive(true);
        user.setRoles(roles);

        userJpaRepository.save(user);
        LOGGER.info("Local admin bootstrap ensured for {}", email);
    }

    private String normalize(String value) {
        return value == null ? "" : value.trim().toLowerCase(Locale.ROOT);
    }

    private String normalizeFullName(String value) {
        String normalized = value == null ? "" : value.trim();
        return normalized.isBlank() ? "Local Administrator" : normalized;
    }
}
