package com.phaiffer.clinic.modules.auth.presentation;

import com.phaiffer.clinic.modules.auth.application.dto.AuthUserResponse;
import com.phaiffer.clinic.modules.auth.application.dto.LoginRequest;
import com.phaiffer.clinic.modules.auth.application.usecase.AuthService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/login")
    public AuthUserResponse login(
            @Valid @RequestBody LoginRequest request,
            HttpServletRequest httpServletRequest,
            HttpServletResponse httpServletResponse
    ) {
        return authService.login(request, httpServletRequest, httpServletResponse);
    }

    @PostMapping("/logout")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void logout(
            Authentication authentication,
            HttpServletRequest request,
            HttpServletResponse response
    ) {
        authService.logout(request, response, authentication);
    }

    @GetMapping("/me")
    public AuthUserResponse me(Authentication authentication) {
        return authService.getCurrentUser(authentication);
    }
}
