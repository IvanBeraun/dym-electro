package com.dymelectro.dymelectro_backend.dto.cliente;

import jakarta.validation.constraints.NotBlank;

public record EditarClienteRequest(
        @NotBlank String nombres,
        @NotBlank String apellidos,
        String telefono,
        String direccion
) {}
