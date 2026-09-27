package com.dymelectro.dymelectro_backend.dto.producto;

import java.math.BigDecimal;

public record FiltroProductoRequest(
        Integer idCategoria,
        Integer idMarca,
        BigDecimal precioMin,
        BigDecimal precioMax
) {}
