package com.dymelectro.dymelectro_backend.dto.compra;

import java.util.List;

public record CompraDetalleResponse(
        CompraCabeceraDTO cabecera,
        List<DetalleCompraDTO> detalle
) {}
