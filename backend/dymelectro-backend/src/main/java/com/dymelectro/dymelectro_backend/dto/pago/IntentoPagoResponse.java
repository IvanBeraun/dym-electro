package com.dymelectro.dymelectro_backend.dto.pago;

import java.math.BigDecimal;

public record IntentoPagoResponse(
        String clientSecret,
        Integer idVenta,
        BigDecimal monto,
        String moneda
) {}