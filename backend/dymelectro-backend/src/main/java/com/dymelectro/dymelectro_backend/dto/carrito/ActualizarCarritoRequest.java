package com.dymelectro.dymelectro_backend.dto.carrito;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

public record ActualizarCarritoRequest(
        @NotNull Integer idProducto,
        @NotNull @Min(1) Integer cantidad
) {}
