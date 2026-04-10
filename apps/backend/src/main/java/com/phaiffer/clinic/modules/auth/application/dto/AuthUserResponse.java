package com.phaiffer.clinic.modules.auth.application.dto;

import java.util.List;

public record AuthUserResponse(
        Long id,
        String email,
        String fullName,
        List<String> roles
) {
}
