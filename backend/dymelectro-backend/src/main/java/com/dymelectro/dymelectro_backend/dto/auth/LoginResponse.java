package com.dymelectro.dymelectro_backend.dto.auth;

public record LoginResponse(
        String token,
        String tipoCuenta,
        Integer id,
        String nombres,
        String apellidos,
        String rol
) {}
