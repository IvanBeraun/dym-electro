package com.dymelectro.dymelectro_backend.dto.pago;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;

public record PagoStripeRequest(
        @NotNull Integer idVenta,
        @NotBlank String stripePaymentId,
        @NotNull @DecimalMin(value = "0.0", inclusive = false) BigDecimal monto,
        @NotBlank String moneda,
        @NotBlank String estadoPago,
        String tarjetaMarca,
        String tarjetaTipo,
        String mensajeRespuesta
) {}