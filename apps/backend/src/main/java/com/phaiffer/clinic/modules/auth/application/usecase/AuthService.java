package com.phaiffer.clinic.modules.auth.application.usecase;

import com.phaiffer.clinic.modules.auth.application.dto.AuthUserResponse;
import com.phaiffer.clinic.modules.auth.application.dto.LoginRequest;
import com.phaiffer.clinic.modules.auth.infrastructure.security.ClinicUserPrincipal;
import com.phaiffer.clinic.shared.exception.InvalidAuthenticationException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.DisabledException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.context.SecurityContextRepository;
import org.springframework.security.web.authentication.logout.SecurityContextLogoutHandler;
import org.springframework.stereotype.Service;

import java.util.Locale;

@Service
public class AuthService {

    private final AuthenticationManager authenticationManager;
    private final SecurityContextRepository securityContextRepository;

    public AuthService(
            AuthenticationManager authenticationManager,
            SecurityContextRepository securityContextRepository
    ) {
        this.authenticationManager = authenticationManager;
        this.securityContextRepository = securityContextRepository;
    }

    public AuthUserResponse login(LoginRequest loginRequest, HttpServletRequest request, HttpServletResponse response) {
        String normalizedEmail = loginRequest.email().trim().toLowerCase(Locale.ROOT);

        try {
            Authentication authentication = authenticationManager.authenticate(
                    UsernamePasswordAuthenticationToken.unauthenticated(normalizedEmail, loginRequest.password())
            );

            SecurityContext context = SecurityContextHolder.createEmptyContext();
            context.setAuthentication(authentication);
            SecurityContextHolder.setContext(context);
            securityContextRepository.saveContext(context, request, response);

            return toResponse((ClinicUserPrincipal) authentication.getPrincipal());
        } catch (BadCredentialsException | DisabledException exception) {
            throw new InvalidAuthenticationException("Invalid email or password");
        }
    }

    public AuthUserResponse getCurrentUser(Authentication authentication) {
        return toResponse((ClinicUserPrincipal) authentication.getPrincipal());
    }

    public void logout(HttpServletRequest request, HttpServletResponse response, Authentication authentication) {
        new SecurityContextLogoutHandler().logout(request, response, authentication);
    }

    private AuthUserResponse toResponse(ClinicUserPrincipal principal) {
        return new AuthUserResponse(
                principal.getId(),
                principal.getUsername(),
                principal.getFullName(),
                principal.getRoleNames()
        );
    }
}
