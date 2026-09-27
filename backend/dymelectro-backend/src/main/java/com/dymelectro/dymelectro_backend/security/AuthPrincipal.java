package com.dymelectro.dymelectro_backend.security;

public record AuthPrincipal(
        Integer id,
        String email,
        String tipoCuenta,
        String rol
) {
    public boolean esUsuarioInterno() {
        return "USUARIO".equals(tipoCuenta);
    }

    public boolean esCliente() {
        return "CLIENTE".equals(tipoCuenta);
    }
}
