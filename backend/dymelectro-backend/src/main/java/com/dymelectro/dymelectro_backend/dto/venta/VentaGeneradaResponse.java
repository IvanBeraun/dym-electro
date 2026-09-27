package com.dymelectro.dymelectro_backend.dto.venta;

import java.math.BigDecimal;

public record VentaGeneradaResponse(
        Integer idVenta,
        String serie,
        Integer numero,
        BigDecimal subtotal,
        BigDecimal igv,
        BigDecimal total
) {}