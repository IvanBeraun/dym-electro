package com.dymelectro.dymelectro_backend.dto.venta;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record ComprobanteCabeceraDTO(
        Integer idVenta,
        String tipoComprobante,
        String serieComprobante,
        Integer numeroComprobante,
        LocalDateTime fechaVenta,
        BigDecimal subtotal,
        BigDecimal igv,
        BigDecimal total,
        String estadoVenta,
        String nombresCliente,
        String apellidosCliente,
        String tipoDocumento,
        String numeroDocumento,
        String rucFacturacion,
        String razonSocialFacturacion,
        String tarjetaMarca,
        String tarjetaUltimos4
) {
    /** Constructor de compatibilidad para sp_listar_ventas, esto no devuelve datos de tarjeta. */
    public ComprobanteCabeceraDTO(Integer idVenta, String tipoComprobante, String serieComprobante,
                                  Integer numeroComprobante, LocalDateTime fechaVenta, BigDecimal subtotal, BigDecimal igv,
                                  BigDecimal total, String estadoVenta, String nombresCliente, String apellidosCliente,
                                  String tipoDocumento, String numeroDocumento, String rucFacturacion, String razonSocialFacturacion) {
        this(idVenta, tipoComprobante, serieComprobante, numeroComprobante, fechaVenta, subtotal, igv,
                total, estadoVenta, nombresCliente, apellidosCliente, tipoDocumento, numeroDocumento,
                rucFacturacion, razonSocialFacturacion, null, null);
    }
}