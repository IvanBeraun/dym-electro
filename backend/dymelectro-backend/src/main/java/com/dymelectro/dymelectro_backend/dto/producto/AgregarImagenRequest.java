package com.dymelectro.dymelectro_backend.dto.producto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record AgregarImagenRequest(
        @NotNull Integer idProducto,
        @NotBlank String urlImagen,
        boolean esPrincipal,
        int orden
) {}
