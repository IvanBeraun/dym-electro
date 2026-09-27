package com.dymelectro.dymelectro_backend.dto.producto;

import java.math.BigDecimal;
import java.util.List;

public record ProductoDetalleDTO(
        Integer idProducto,
        String codigo,
        String nombre,
        String descripcion,
        BigDecimal precioVenta,
        Integer stock,
        String categoria,
        String marca,
        List<ImagenDTO> imagenes
) {}
