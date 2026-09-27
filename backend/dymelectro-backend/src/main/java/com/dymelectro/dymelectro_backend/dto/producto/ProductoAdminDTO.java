package com.dymelectro.dymelectro_backend.dto.producto;

import java.math.BigDecimal;

public record ProductoAdminDTO(
        Integer idProducto,
        String codigo,
        String nombre,
        String descripcion,
        BigDecimal precioVenta,
        Integer stock,
        Integer stockMinimo,
        Integer idCategoria,
        Integer idMarca,
        Boolean estado
) {}