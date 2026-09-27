package com.dymelectro.dymelectro_backend.dto.pago;

import jakarta.validation.constraints.NotNull;

public record CrearIntentoPagoRequest(
        @NotNull Integer idVenta
) {}