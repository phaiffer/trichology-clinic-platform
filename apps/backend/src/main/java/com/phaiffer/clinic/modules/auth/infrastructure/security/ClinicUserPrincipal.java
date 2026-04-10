package com.phaiffer.clinic.modules.auth.infrastructure.security;

import com.phaiffer.clinic.modules.auth.domain.model.Role;
import com.phaiffer.clinic.modules.auth.domain.model.User;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collection;
import java.util.List;

public class ClinicUserPrincipal implements UserDetails {

    private final Long id;
    private final String email;
    private final String passwordHash;
    private final String fullName;
    private final boolean active;
    private final List<GrantedAuthority> authorities;
    private final List<String> roleNames;

    public ClinicUserPrincipal(User user) {
        this.id = user.getId();
        this.email = user.getEmail();
        this.passwordHash = user.getPasswordHash();
        this.fullName = user.getFullName();
        this.active = user.isActive();
        this.roleNames = user.getRoles().stream()
                .map(Role::getName)
                .sorted()
                .toList();
        this.authorities = roleNames.stream()
                .map(roleName -> new SimpleGrantedAuthority("ROLE_" + roleName))
                .map(GrantedAuthority.class::cast)
                .toList();
    }

    public Long getId() {
        return id;
    }

    public String getFullName() {
        return fullName;
    }

    public List<String> getRoleNames() {
        return roleNames;
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return authorities;
    }

    @Override
    public String getPassword() {
        return passwordHash;
    }

    @Override
    public String getUsername() {
        return email;
    }

    @Override
    public boolean isAccountNonExpired() {
        return active;
    }

    @Override
    public boolean isAccountNonLocked() {
        return active;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return active;
    }

    @Override
    public boolean isEnabled() {
        return active;
    }
}
