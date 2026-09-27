package com.dymelectro.dymelectro_backend.service;

import com.dymelectro.dymelectro_backend.dao.JdbcProcedureSupport;
import com.dymelectro.dymelectro_backend.dao.VentaDao;
import com.dymelectro.dymelectro_backend.dto.venta.ComprobanteCabeceraDTO;
import com.dymelectro.dymelectro_backend.dto.venta.ComprobanteResponse;
import com.dymelectro.dymelectro_backend.dto.venta.DetalleVentaDTO;
import com.dymelectro.dymelectro_backend.dto.venta.HistorialVentaDTO;
import com.dymelectro.dymelectro_backend.dto.venta.VentaGeneradaResponse;
import com.dymelectro.dymelectro_backend.exception.ResourceNotFoundException;
import com.dymelectro.dymelectro_backend.security.AuthPrincipal;
import org.springframework.stereotype.Service;
import com.dymelectro.dymelectro_backend.exception.BusinessException;

import java.util.List;

@Service
public class VentaService {

    private final VentaDao ventaDao;
    private final ComprobantePdfService comprobantePdfService;

    public VentaService(VentaDao ventaDao, ComprobantePdfService comprobantePdfService) {
        this.ventaDao = ventaDao;
        this.comprobantePdfService = comprobantePdfService;
    }

    public VentaGeneradaResponse generarVenta(Integer idCliente, String tipoComprobante, String ruc, String razonSocial) {
        if ("Factura".equals(tipoComprobante)) {
            if (ruc == null || ruc.isBlank()) {
                throw new BusinessException("Para Factura debes indicar el RUC del comprador");
            }
            if (razonSocial == null || razonSocial.isBlank()) {
                throw new BusinessException("Para Factura debes indicar la razón social del comprador");
            }
        }
        return ventaDao.generarVenta(idCliente, tipoComprobante, ruc, razonSocial);
    }

    public void anular(Integer idVenta) {
        ventaDao.anularVenta(idVenta);
    }

    /**
     * Un cliente solo puede ver/descargar SUS propias ventas; el personal
     * interno (USUARIO) puede ver cualquiera. Se devuelve 404 (no 403) cuando
     * la venta no le pertenece a un cliente, para no confirmarle que ese ID
     * de venta existe.
     */
    public ComprobanteResponse obtenerComprobante(Integer idVenta, AuthPrincipal solicitante) {
        JdbcProcedureSupport.TwoResultSets<ComprobanteCabeceraDTO, DetalleVentaDTO> resultado =
                ventaDao.obtenerComprobante(idVenta);
        if (resultado.first().isEmpty()) {
            throw new ResourceNotFoundException("Venta no encontrada");
        }
        if (solicitante.esCliente() && !perteneceAlCliente(idVenta, solicitante.id())) {
            throw new ResourceNotFoundException("Venta no encontrada");
        }
        return new ComprobanteResponse(resultado.first().get(0), resultado.second());
    }

    public byte[] generarComprobantePdf(Integer idVenta, AuthPrincipal solicitante) {
        ComprobanteResponse comprobante = obtenerComprobante(idVenta, solicitante);
        return comprobantePdfService.generar(comprobante);
    }

    private boolean perteneceAlCliente(Integer idVenta, Integer idCliente) {
        return historialCliente(idCliente).stream().anyMatch(v -> v.idVenta().equals(idVenta));
    }

    public List<HistorialVentaDTO> historialCliente(Integer idCliente) {
        return ventaDao.historialCliente(idCliente);
    }

    public List<ComprobanteCabeceraDTO> listarTodas() {
        return ventaDao.listarVentas();
    }

    public void cancelarPendiente(Integer idVenta, Integer idCliente) {
        ventaDao.cancelarPendiente(idVenta, idCliente);
    }
}