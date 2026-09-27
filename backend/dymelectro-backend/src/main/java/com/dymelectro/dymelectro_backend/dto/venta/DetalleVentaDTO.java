package com.dymelectro.dymelectro_backend.dto.venta;

import java.math.BigDecimal;

public record DetalleVentaDTO(
        Integer idProducto,
        String nombre,
        Integer cantidad,
        BigDecimal precioVenta,
        BigDecimal subtotal
) {}
