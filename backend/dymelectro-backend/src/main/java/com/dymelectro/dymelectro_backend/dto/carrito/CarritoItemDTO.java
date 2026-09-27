package com.dymelectro.dymelectro_backend.dto.carrito;

import java.math.BigDecimal;

public record CarritoItemDTO(
        Integer idProducto,
        String nombre,
        BigDecimal precioVenta,
        Integer cantidad,
        BigDecimal subtotal,
        Integer stock,
        String imagenPrincipal
) {}
