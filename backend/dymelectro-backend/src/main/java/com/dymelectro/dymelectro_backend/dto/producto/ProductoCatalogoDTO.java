package com.dymelectro.dymelectro_backend.dto.producto;

import java.math.BigDecimal;

public record ProductoCatalogoDTO(
        Integer idProducto,
        String codigo,
        String nombre,
        String descripcion,
        BigDecimal precioVenta,
        Integer stock,
        String categoria,
        String marca,
        String imagenPrincipal
) {}
