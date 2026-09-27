package com.dymelectro.dymelectro_backend.controller;

import com.dymelectro.dymelectro_backend.dto.compra.CompraCabeceraDTO;
import com.dymelectro.dymelectro_backend.dto.compra.CompraDetalleResponse;
import com.dymelectro.dymelectro_backend.dto.compra.DetalleCompraRequest;
import com.dymelectro.dymelectro_backend.dto.compra.RegistrarCompraRequest;
import com.dymelectro.dymelectro_backend.service.CompraService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/compras")
@PreAuthorize("hasRole('USUARIO')")
public class CompraController {

    private final CompraService compraService;

    public CompraController(CompraService compraService) {
        this.compraService = compraService;
    }

    @PostMapping
    public ResponseEntity<Map<String, Integer>> registrar(@Valid @RequestBody RegistrarCompraRequest request) {
        Integer id = compraService.registrarCompra(request.idProveedor(), request.numeroComprobante());
        return ResponseEntity.status(HttpStatus.CREATED).body(Map.of("idCompra", id));
    }

    @GetMapping
    public ResponseEntity<List<CompraCabeceraDTO>> listar() {
        return ResponseEntity.ok(compraService.listarTodas());
    }

    @PostMapping("/{idCompra}/detalle")
    public ResponseEntity<Void> agregarDetalle(@PathVariable Integer idCompra, @Valid @RequestBody DetalleCompraRequest request) {
        compraService.agregarDetalle(idCompra, request.idProducto(), request.cantidad(), request.precioCompra());
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{idCompra}")
    public ResponseEntity<CompraDetalleResponse> detalle(@PathVariable Integer idCompra) {
        return ResponseEntity.ok(compraService.obtenerDetalle(idCompra));
    }
}
