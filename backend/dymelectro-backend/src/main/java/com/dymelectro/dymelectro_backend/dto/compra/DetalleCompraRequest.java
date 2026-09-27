package com.dymelectro.dymelectro_backend.dto.compra;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;

public record DetalleCompraRequest(
        @NotNull Integer idProducto,
        @NotNull @Min(1) Integer cantidad,
        @NotNull @DecimalMin(value = "0.0", inclusive = false) BigDecimal precioCompra
) {}
