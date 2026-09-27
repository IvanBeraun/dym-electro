package com.dymelectro.dymelectro_backend.dao;

import com.dymelectro.dymelectro_backend.dto.compra.CompraCabeceraDTO;
import com.dymelectro.dymelectro_backend.dto.compra.DetalleCompraDTO;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public class CompraDao {

    private final JdbcProcedureSupport jdbc;

    public CompraDao(JdbcProcedureSupport jdbc) {
        this.jdbc = jdbc;
    }

    private static final RowMapper<Integer> ID_COMPRA_MAPPER = (rs, i) -> rs.getInt("id_compra");

    private static final RowMapper<CompraCabeceraDTO> CABECERA_MAPPER = (rs, i) -> new CompraCabeceraDTO(
            rs.getInt("id_compra"),
            rs.getTimestamp("fecha_compra") != null ? rs.getTimestamp("fecha_compra").toLocalDateTime() : null,
            rs.getBigDecimal("total"), rs.getString("numero_comprobante"), rs.getString("proveedor")
    );

    private static final RowMapper<DetalleCompraDTO> DETALLE_MAPPER = (rs, i) -> new DetalleCompraDTO(
            rs.getInt("id_producto"), rs.getString("nombre"), rs.getInt("cantidad"), rs.getBigDecimal("precio_compra")
    );

    public Integer registrarCompra(Integer idProveedor, String numeroComprobante) {
        return jdbc.queryForOptional("{call sp_registrar_compra(?,?)}", ID_COMPRA_MAPPER, idProveedor, numeroComprobante)
                .orElseThrow();
    }

    public void agregarDetalle(Integer idCompra, Integer idProducto, Integer cantidad, java.math.BigDecimal precioCompra) {
        jdbc.execute("{call sp_agregar_detalle_compra(?,?,?,?)}", idCompra, idProducto, cantidad, precioCompra);
    }

    /** sp_obtener_detalle_compra devuelve 2 result sets: cabecera y detalle. */
    public JdbcProcedureSupport.TwoResultSets<CompraCabeceraDTO, DetalleCompraDTO> obtenerDetalle(Integer idCompra) {
        return jdbc.queryTwoResultSets("{call sp_obtener_detalle_compra(?)}", CABECERA_MAPPER, DETALLE_MAPPER, idCompra);
    }
    public List<CompraCabeceraDTO> listarCompras() {
        return jdbc.queryForList("{call sp_listar_compras()}", CABECERA_MAPPER);
    }
}
