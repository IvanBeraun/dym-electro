package com.dymelectro.dymelectro_backend.dto.venta;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record HistorialVentaDTO(
        Integer idVenta,
        String tipoComprobante,
        String serieComprobante,
        Integer numeroComprobante,
        LocalDateTime fechaVenta,
        BigDecimal subtotal,
        BigDecimal igv,
        BigDecimal total,
        String estadoVenta
) {}