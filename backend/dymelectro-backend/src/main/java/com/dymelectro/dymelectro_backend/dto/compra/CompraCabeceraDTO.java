package com.dymelectro.dymelectro_backend.dto.compra;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record CompraCabeceraDTO(
        Integer idCompra,
        LocalDateTime fechaCompra,
        BigDecimal total,
        String numeroComprobante,
        String proveedor
) {}
