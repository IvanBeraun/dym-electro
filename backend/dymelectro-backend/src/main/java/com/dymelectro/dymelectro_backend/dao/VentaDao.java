package com.dymelectro.dymelectro_backend.dao;

import com.dymelectro.dymelectro_backend.dto.venta.ComprobanteCabeceraDTO;
import com.dymelectro.dymelectro_backend.dto.venta.DetalleVentaDTO;
import com.dymelectro.dymelectro_backend.dto.venta.HistorialVentaDTO;
import com.dymelectro.dymelectro_backend.dto.venta.VentaGeneradaResponse;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public class VentaDao {

    private final JdbcProcedureSupport jdbc;

    public VentaDao(JdbcProcedureSupport jdbc) {
        this.jdbc = jdbc;
    }

    private static final RowMapper<VentaGeneradaResponse> VENTA_GENERADA_MAPPER = (rs, i) -> new VentaGeneradaResponse(
            rs.getInt("id_venta"), rs.getString("serie"), rs.getInt("numero"),
            rs.getBigDecimal("subtotal"), rs.getBigDecimal("igv"), rs.getBigDecimal("total")
    );

    private static final RowMapper<ComprobanteCabeceraDTO> CABECERA_MAPPER = (rs, i) -> new ComprobanteCabeceraDTO(
            rs.getInt("id_venta"), rs.getString("tipo_comprobante"), rs.getString("serie_comprobante"),
            rs.getInt("numero_comprobante"),
            rs.getTimestamp("fecha_venta") != null ? rs.getTimestamp("fecha_venta").toLocalDateTime() : null,
            rs.getBigDecimal("subtotal"), rs.getBigDecimal("igv"), rs.getBigDecimal("total"), rs.getString("estado_venta"),
            rs.getString("nombres"), rs.getString("apellidos"), rs.getString("tipo_documento"), rs.getString("numero_documento"),
            rs.getString("ruc_facturacion"), rs.getString("razon_social_facturacion")
    );

    private static final RowMapper<ComprobanteCabeceraDTO> CABECERA_CON_PAGO_MAPPER = (rs, i) -> new ComprobanteCabeceraDTO(
            rs.getInt("id_venta"), rs.getString("tipo_comprobante"), rs.getString("serie_comprobante"),
            rs.getInt("numero_comprobante"),
            rs.getTimestamp("fecha_venta") != null ? rs.getTimestamp("fecha_venta").toLocalDateTime() : null,
            rs.getBigDecimal("subtotal"), rs.getBigDecimal("igv"), rs.getBigDecimal("total"), rs.getString("estado_venta"),
            rs.getString("nombres"), rs.getString("apellidos"), rs.getString("tipo_documento"), rs.getString("numero_documento"),
            rs.getString("ruc_facturacion"), rs.getString("razon_social_facturacion"),
            rs.getString("tarjeta_marca"), rs.getString("tarjeta_ultimos4")
    );

    private static final RowMapper<DetalleVentaDTO> DETALLE_MAPPER = (rs, i) -> new DetalleVentaDTO(
            rs.getInt("id_producto"), rs.getString("nombre"), rs.getInt("cantidad"),
            rs.getBigDecimal("precio_venta"), rs.getBigDecimal("subtotal")
    );

    private static final RowMapper<HistorialVentaDTO> HISTORIAL_MAPPER = (rs, i) -> new HistorialVentaDTO(
            rs.getInt("id_venta"), rs.getString("tipo_comprobante"), rs.getString("serie_comprobante"),
            rs.getInt("numero_comprobante"),
            rs.getTimestamp("fecha_venta") != null ? rs.getTimestamp("fecha_venta").toLocalDateTime() : null,
            rs.getBigDecimal("subtotal"), rs.getBigDecimal("igv"), rs.getBigDecimal("total"), rs.getString("estado_venta")
    );

    public VentaGeneradaResponse generarVenta(Integer idCliente, String tipoComprobante, String ruc, String razonSocial) {
        return jdbc.queryForOptional("{call sp_generar_venta(?,?,?,?)}", VENTA_GENERADA_MAPPER,
                        idCliente, tipoComprobante, ruc, razonSocial)
                .orElseThrow();
    }

    public void anularVenta(Integer idVenta) {
        jdbc.execute("{call sp_anular_venta(?)}", idVenta);
    }

    /** sp_obtener_comprobante devuelve 2 result sets: cabecera y detalle. */
    public JdbcProcedureSupport.TwoResultSets<ComprobanteCabeceraDTO, DetalleVentaDTO> obtenerComprobante(Integer idVenta) {
        return jdbc.queryTwoResultSets("{call sp_obtener_comprobante(?)}", CABECERA_CON_PAGO_MAPPER, DETALLE_MAPPER, idVenta);
    }

    public List<HistorialVentaDTO> historialCliente(Integer idCliente) {
        return jdbc.queryForList("{call sp_historial_ventas_cliente(?)}", HISTORIAL_MAPPER, idCliente);
    }

    public List<ComprobanteCabeceraDTO> listarVentas() {
        return jdbc.queryForList("{call sp_listar_ventas()}", CABECERA_MAPPER);
    }

    public void cancelarPendiente(Integer idVenta, Integer idCliente) {
        jdbc.execute("{call sp_cancelar_venta_pendiente(?,?)}", idVenta, idCliente);
    }
}
