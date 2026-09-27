package com.dymelectro.dymelectro_backend.service;

import com.dymelectro.dymelectro_backend.dao.CompraDao;
import com.dymelectro.dymelectro_backend.dao.JdbcProcedureSupport;
import com.dymelectro.dymelectro_backend.dto.compra.CompraCabeceraDTO;
import com.dymelectro.dymelectro_backend.dto.compra.CompraDetalleResponse;
import com.dymelectro.dymelectro_backend.dto.compra.DetalleCompraDTO;
import com.dymelectro.dymelectro_backend.exception.ResourceNotFoundException;
import org.springframework.stereotype.Service;

@Service
public class CompraService {

    private final CompraDao compraDao;

    public CompraService(CompraDao compraDao) {
        this.compraDao = compraDao;
    }

    public Integer registrarCompra(Integer idProveedor, String numeroComprobante) {
        return compraDao.registrarCompra(idProveedor, numeroComprobante);
    }

    public void agregarDetalle(Integer idCompra, Integer idProducto, Integer cantidad, java.math.BigDecimal precioCompra) {
        // El trigger trg_detalle_compras_after_insert aumenta el stock automaticamente.
        compraDao.agregarDetalle(idCompra, idProducto, cantidad, precioCompra);
    }

    public CompraDetalleResponse obtenerDetalle(Integer idCompra) {
        JdbcProcedureSupport.TwoResultSets<CompraCabeceraDTO, DetalleCompraDTO> resultado = compraDao.obtenerDetalle(idCompra);
        if (resultado.first().isEmpty()) {
            throw new ResourceNotFoundException("Compra no encontrada");
        }
        return new CompraDetalleResponse(resultado.first().get(0), resultado.second());
    }
    public java.util.List<CompraCabeceraDTO> listarTodas() {
        return compraDao.listarCompras();
    }
}
