package com.dymelectro.dymelectro_backend.service;

import com.dymelectro.dymelectro_backend.dao.CatalogoDao;
import com.dymelectro.dymelectro_backend.dao.JdbcProcedureSupport;
import com.dymelectro.dymelectro_backend.dto.producto.FiltroProductoRequest;
import com.dymelectro.dymelectro_backend.dto.producto.CrearProductoRequest;
import com.dymelectro.dymelectro_backend.dto.producto.EditarProductoRequest;
import com.dymelectro.dymelectro_backend.dto.producto.ProductoAdminDTO;
import com.dymelectro.dymelectro_backend.dto.producto.ImagenDTO;
import com.dymelectro.dymelectro_backend.dto.producto.ProductoCatalogoDTO;
import com.dymelectro.dymelectro_backend.dto.producto.ProductoDetalleDTO;
import com.dymelectro.dymelectro_backend.exception.ResourceNotFoundException;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.List;

@Service
public class CatalogoService {

    private final CatalogoDao catalogoDao;

    public CatalogoService(CatalogoDao catalogoDao) {
        this.catalogoDao = catalogoDao;
    }

    public List<ProductoCatalogoDTO> listar() {
        return catalogoDao.listarCatalogo();
    }

    public List<ProductoCatalogoDTO> buscar(String texto) {
        return catalogoDao.buscar(texto);
    }

    public List<ProductoCatalogoDTO> filtrar(FiltroProductoRequest f) {
        return catalogoDao.filtrar(f.idCategoria(), f.idMarca(), f.precioMin(), f.precioMax());
    }

    public ProductoDetalleDTO obtenerDetalle(Integer idProducto) {
        JdbcProcedureSupport.TwoResultSets<Object[], ImagenDTO> resultado = catalogoDao.obtenerDetalle(idProducto);

        if (resultado.first().isEmpty()) {
            throw new ResourceNotFoundException("Producto no encontrado");
        }

        Object[] cab = resultado.first().get(0);
        return new ProductoDetalleDTO(
                (Integer) cab[0], (String) cab[1], (String) cab[2], (String) cab[3],
                (BigDecimal) cab[4], (Integer) cab[5], (String) cab[6], (String) cab[7],
                resultado.second()
        );
    }

    public void agregarImagen(Integer idProducto, String url, boolean esPrincipal, int orden) {
        catalogoDao.agregarImagen(idProducto, url, esPrincipal, orden);
    }

    public void eliminarImagen(Integer idImagen) {
        catalogoDao.eliminarImagen(idImagen);
    }

    public Integer crearProducto(com.dymelectro.dymelectro_backend.dto.producto.CrearProductoRequest r) {
        return catalogoDao.crearProducto(r.codigo(), r.nombre(), r.descripcion(), r.precioVenta(),
                r.stock(), r.stockMinimo(), r.idCategoria(), r.idMarca());
    }

    public void editarProducto(Integer idProducto, com.dymelectro.dymelectro_backend.dto.producto.EditarProductoRequest r) {
        catalogoDao.editarProducto(idProducto, r.codigo(), r.nombre(), r.descripcion(), r.precioVenta(),
                r.stockMinimo(), r.idCategoria(), r.idMarca());
    }

    public com.dymelectro.dymelectro_backend.dto.producto.ProductoAdminDTO obtenerParaEditar(Integer idProducto) {
        return catalogoDao.obtenerParaEditar(idProducto)
                .orElseThrow(() -> new ResourceNotFoundException("Producto no encontrado"));
    }

    public void ajustarStock(Integer idProducto, Integer stock) {
        catalogoDao.ajustarStock(idProducto, stock);
    }

    public void cambiarEstadoProducto(Integer idProducto, boolean estado) {
        catalogoDao.cambiarEstadoProducto(idProducto, estado);
    }
}
