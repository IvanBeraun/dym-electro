package com.dymelectro.dymelectro_backend.controller;

import com.dymelectro.dymelectro_backend.dto.producto.*;
import com.dymelectro.dymelectro_backend.service.CatalogoService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/productos")
@PreAuthorize("hasAnyRole('ADMINISTRADOR', 'ALMACENERO')")
public class ProductoController {

    private final CatalogoService catalogoService;

    public ProductoController(CatalogoService catalogoService) {
        this.catalogoService = catalogoService;
    }

    @PostMapping
    public ResponseEntity<Map<String, Integer>> crear(@Valid @RequestBody CrearProductoRequest request) {
        Integer id = catalogoService.crearProducto(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(Map.of("idProducto", id));
    }

    @PutMapping("/{idProducto}")
    public ResponseEntity<Void> editar(@PathVariable Integer idProducto, @Valid @RequestBody EditarProductoRequest request) {
        catalogoService.editarProducto(idProducto, request);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{idProducto}")
    public ResponseEntity<ProductoAdminDTO> obtenerParaEditar(@PathVariable Integer idProducto) {
        return ResponseEntity.ok(catalogoService.obtenerParaEditar(idProducto));
    }

    @PatchMapping("/{idProducto}/stock")
    public ResponseEntity<Void> ajustarStock(@PathVariable Integer idProducto, @Valid @RequestBody AjustarStockRequest request) {
        catalogoService.ajustarStock(idProducto, request.stock());
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/{idProducto}/estado")
    public ResponseEntity<Void> cambiarEstado(@PathVariable Integer idProducto, @Valid @RequestBody CambiarEstadoProductoRequest request) {
        catalogoService.cambiarEstadoProducto(idProducto, request.estado());
        return ResponseEntity.noContent().build();
    }
}