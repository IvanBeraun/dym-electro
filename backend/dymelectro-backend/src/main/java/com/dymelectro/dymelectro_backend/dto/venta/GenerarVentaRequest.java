package com.dymelectro.dymelectro_backend.dto.venta;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

public record GenerarVentaRequest(
        @NotBlank @Pattern(regexp = "Boleta|Factura", message = "Debe ser 'Boleta' o 'Factura'") String tipoComprobante,
        @Pattern(regexp = "\\d{11}", message = "El RUC debe tener 11 digitos") String ruc,
        String razonSocial
) {}