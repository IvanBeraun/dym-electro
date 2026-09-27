package com.dymelectro.dymelectro_backend.controller;

import com.dymelectro.dymelectro_backend.dto.venta.ComprobanteCabeceraDTO;
import com.dymelectro.dymelectro_backend.dto.venta.ComprobanteResponse;
import com.dymelectro.dymelectro_backend.dto.venta.GenerarVentaRequest;
import com.dymelectro.dymelectro_backend.dto.venta.HistorialVentaDTO;
import com.dymelectro.dymelectro_backend.dto.venta.VentaGeneradaResponse;
import com.dymelectro.dymelectro_backend.security.AuthPrincipal;
import com.dymelectro.dymelectro_backend.service.VentaService;
import jakarta.validation.Valid;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/ventas")
public class VentaController {

    private final VentaService ventaService;

    public VentaController(VentaService ventaService) {
        this.ventaService = ventaService;
    }

    @GetMapping
    @PreAuthorize("hasRole('USUARIO')")
    public ResponseEntity<List<ComprobanteCabeceraDTO>> listar() {
        return ResponseEntity.ok(ventaService.listarTodas());
    }

    @PostMapping
    @PreAuthorize("hasRole('CLIENTE')")
    public ResponseEntity<VentaGeneradaResponse> generar(@AuthenticationPrincipal AuthPrincipal p,
                                                         @Valid @RequestBody GenerarVentaRequest request) {
        VentaGeneradaResponse resp = ventaService.generarVenta(p.id(), request.tipoComprobante(),
                request.ruc(), request.razonSocial());
        return ResponseEntity.status(HttpStatus.CREATED).body(resp);
    }

    /** El cliente cancela su propia venta mientras siga pendiente de pago */
    @PatchMapping("/{idVenta}/cancelar")
    @PreAuthorize("hasRole('CLIENTE')")
    public ResponseEntity<Void> cancelar(@PathVariable Integer idVenta, @AuthenticationPrincipal AuthPrincipal p) {
        ventaService.cancelarPendiente(idVenta, p.id());
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{idVenta}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ComprobanteResponse> comprobante(@PathVariable Integer idVenta,
                                                           @AuthenticationPrincipal AuthPrincipal p) {
        return ResponseEntity.ok(ventaService.obtenerComprobante(idVenta, p));
    }

    /** Descarga el mismo comprobante como PDF. Misma regla de dueño como el endpoint de arriba */
    @GetMapping("/{idVenta}/pdf")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<byte[]> descargarPdf(@PathVariable Integer idVenta,
                                               @AuthenticationPrincipal AuthPrincipal p) {
        byte[] pdf = ventaService.generarComprobantePdf(idVenta, p);
        String nombreArchivo = "comprobante-" + idVenta + ".pdf";
        return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_PDF)
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + nombreArchivo + "\"")
                .body(pdf);
    }

    @GetMapping("/mias")
    @PreAuthorize("hasRole('CLIENTE')")
    public ResponseEntity<List<HistorialVentaDTO>> misVentas(@AuthenticationPrincipal AuthPrincipal p) {
        return ResponseEntity.ok(ventaService.historialCliente(p.id()));
    }

    @PatchMapping("/{idVenta}/anular")
    @PreAuthorize("hasRole('USUARIO')")
    public ResponseEntity<Void> anular(@PathVariable Integer idVenta) {
        ventaService.anular(idVenta);
        return ResponseEntity.noContent().build();
    }
}
