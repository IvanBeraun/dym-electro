package com.dymelectro.dymelectro_backend.dto.compra;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record RegistrarCompraRequest(
        @NotNull Integer idProveedor,
        @NotBlank String numeroComprobante
) {}
