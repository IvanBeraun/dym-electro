package com.dymelectro.dymelectro_backend.dao;

import com.dymelectro.dymelectro_backend.dto.producto.ImagenDTO;
import com.dymelectro.dymelectro_backend.dto.producto.ProductoCatalogoDTO;
import com.dymelectro.dymelectro_backend.dto.producto.ProductoAdminDTO;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public class CatalogoDao {

    private final JdbcProcedureSupport jdbc;

    public CatalogoDao(JdbcProcedureSupport jdbc) {
        this.jdbc = jdbc;
    }

    private static final RowMapper<ProductoCatalogoDTO> CATALOGO_MAPPER = (rs, i) -> new ProductoCatalogoDTO(
            rs.getInt("id_producto"),
            rs.getString("codigo"),
            rs.getString("nombre"),
            hasColumn(rs, "descripcion") ? rs.getString("descripcion") : null,
            rs.getBigDecimal("precio_venta"),
            rs.getInt("stock"),
            rs.getString("categoria"),
            rs.getString("marca"),
            rs.getString("imagen_principal")
    );

    private static final RowMapper<Object[]> PRODUCTO_CABECERA_RAW = (rs, i) -> new Object[]{
            rs.getInt("id_producto"), rs.getString("codigo"), rs.getString("nombre"), rs.getString("descripcion"),
            rs.getBigDecimal("precio_venta"), rs.getInt("stock"), rs.getString("categoria"), rs.getString("marca")
    };

    private static final RowMapper<ImagenDTO> IMAGEN_MAPPER = (rs, i) -> new ImagenDTO(
            rs.getInt("id_imagen"), rs.getString("url_imagen"), rs.getBoolean("es_principal"), rs.getInt("orden")
    );

    private static boolean hasColumn(java.sql.ResultSet rs, String column) {
        try {
            rs.findColumn(column);
            return true;
        } catch (java.sql.SQLException e) {
            return false;
        }
    }

    public List<ProductoCatalogoDTO> listarCatalogo() {
        return jdbc.queryForList("{call sp_listar_catalogo()}", CATALOGO_MAPPER);
    }

    public List<ProductoCatalogoDTO> buscar(String texto) {
        return jdbc.queryForList("{call sp_buscar_productos(?)}", CATALOGO_MAPPER, texto);
    }

    public List<ProductoCatalogoDTO> filtrar(Integer idCategoria, Integer idMarca, java.math.BigDecimal precioMin, java.math.BigDecimal precioMax) {
        return jdbc.queryForList("{call sp_filtrar_productos(?,?,?,?)}", CATALOGO_MAPPER, idCategoria, idMarca, precioMin, precioMax);
    }

    /** sp_obtener_producto_detalle devuelve 2 result sets: cabecera del producto y sus imagenes. */
    public JdbcProcedureSupport.TwoResultSets<Object[], ImagenDTO> obtenerDetalle(Integer idProducto) {
        return jdbc.queryTwoResultSets("{call sp_obtener_producto_detalle(?)}", PRODUCTO_CABECERA_RAW, IMAGEN_MAPPER, idProducto);
    }

    public void agregarImagen(Integer idProducto, String url, boolean esPrincipal, int orden) {
        jdbc.execute("{call sp_agregar_imagen_producto(?,?,?,?)}", idProducto, url, esPrincipal ? 1 : 0, orden);
    }

    public void eliminarImagen(Integer idImagen) {
        jdbc.execute("{call sp_eliminar_imagen_producto(?)}", idImagen);
    }

    private static final RowMapper<ProductoAdminDTO> ADMIN_MAPPER = (rs, i) -> new ProductoAdminDTO(
            rs.getInt("id_producto"), rs.getString("codigo"), rs.getString("nombre"), rs.getString("descripcion"),
            rs.getBigDecimal("precio_venta"), rs.getInt("stock"), rs.getInt("stock_minimo"),
            rs.getInt("id_categoria"), rs.getInt("id_marca"), rs.getBoolean("estado")
    );

    public Integer crearProducto(String codigo, String nombre, String descripcion, java.math.BigDecimal precioVenta,
                                 Integer stock, Integer stockMinimo, Integer idCategoria, Integer idMarca) {
        RowMapper<Integer> idMapper = (rs, i) -> rs.getInt("id_producto");
        return jdbc.queryForOptional("{call sp_crear_producto(?,?,?,?,?,?,?,?)}", idMapper,
                codigo, nombre, descripcion, precioVenta, stock, stockMinimo, idCategoria, idMarca).orElseThrow();
    }

    public void editarProducto(Integer idProducto, String codigo, String nombre, String descripcion,
                               java.math.BigDecimal precioVenta, Integer stockMinimo, Integer idCategoria, Integer idMarca) {
        jdbc.execute("{call sp_editar_producto(?,?,?,?,?,?,?,?)}",
                idProducto, codigo, nombre, descripcion, precioVenta, stockMinimo, idCategoria, idMarca);
    }

    public java.util.Optional<ProductoAdminDTO> obtenerParaEditar(Integer idProducto) {
        return jdbc.queryForOptional("{call sp_obtener_producto_para_editar(?)}", ADMIN_MAPPER, idProducto);
    }

    public void ajustarStock(Integer idProducto, Integer stock) {
        jdbc.execute("{call sp_ajustar_stock_producto(?,?)}", idProducto, stock);
    }

    public void cambiarEstadoProducto(Integer idProducto, boolean estado) {
        jdbc.execute("{call sp_cambiar_estado_producto(?,?)}", idProducto, estado ? 1 : 0);
    }
}
