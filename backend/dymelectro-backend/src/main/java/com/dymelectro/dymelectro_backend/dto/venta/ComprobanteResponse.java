package com.dymelectro.dymelectro_backend.dto.venta;

import java.util.List;

public record ComprobanteResponse(
        ComprobanteCabeceraDTO cabecera,
        List<DetalleVentaDTO> detalle
) {}
