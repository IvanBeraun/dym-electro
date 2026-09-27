package com.dymelectro.dymelectro_backend.dto.auth;

public record LoginResponse(
        String token,
        String tipoCuenta,   // "USUARIO" (admin/empleado) o "CLIENTE"
        Integer id,
        String nombres,
        String apellidos,
        String rol           // rol para usuarios internos; null para clientes
) {}
