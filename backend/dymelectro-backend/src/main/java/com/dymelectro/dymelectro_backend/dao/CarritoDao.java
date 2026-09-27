package com.dymelectro.dymelectro_backend.dao;

import com.dymelectro.dymelectro_backend.dto.carrito.CarritoItemDTO;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public class CarritoDao {

    private final JdbcProcedureSupport jdbc;

    public CarritoDao(JdbcProcedureSupport jdbc) {
        this.jdbc = jdbc;
    }

    private static final RowMapper<CarritoItemDTO> ITEM_MAPPER = (rs, i) -> new CarritoItemDTO(
            rs.getInt("id_producto"),
            rs.getString("nombre"),
            rs.getBigDecimal("precio_venta"),
            rs.getInt("cantidad"),
            rs.getBigDecimal("subtotal"),
            rs.getInt("stock"),
            rs.getString("imagen_principal")
    );

    public void agregar(Integer idCliente, Integer idProducto, Integer cantidad) {
        jdbc.execute("{call sp_agregar_al_carrito(?,?,?)}", idCliente, idProducto, cantidad);
    }

    public void actualizarCantidad(Integer idCliente, Integer idProducto, Integer cantidad) {
        jdbc.execute("{call sp_actualizar_cantidad_carrito(?,?,?)}", idCliente, idProducto, cantidad);
    }

    public void eliminarProducto(Integer idCliente, Integer idProducto) {
        jdbc.execute("{call sp_eliminar_producto_carrito(?,?)}", idCliente, idProducto);
    }

    public void vaciar(Integer idCliente) {
        jdbc.execute("{call sp_vaciar_carrito(?)}", idCliente);
    }

    public List<CarritoItemDTO> obtenerCarrito(Integer idCliente) {
        return jdbc.queryForList("{call sp_obtener_carrito(?)}", ITEM_MAPPER, idCliente);
    }
}
