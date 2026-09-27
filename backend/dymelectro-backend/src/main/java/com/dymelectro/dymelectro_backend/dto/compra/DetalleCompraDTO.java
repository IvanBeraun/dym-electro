package com.dymelectro.dymelectro_backend.dto.compra;

import java.math.BigDecimal;

public record DetalleCompraDTO(
        Integer idProducto,
        String nombre,
        Integer cantidad,
        BigDecimal precioCompra
) {}
