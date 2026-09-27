package com.dymelectro.dymelectro_backend.controller;

import com.dymelectro.dymelectro_backend.dto.producto.AgregarImagenRequest;
import com.dymelectro.dymelectro_backend.dto.producto.FiltroProductoRequest;
import com.dymelectro.dymelectro_backend.dto.producto.ProductoCatalogoDTO;
import com.dymelectro.dymelectro_backend.dto.producto.ProductoDetalleDTO;
import com.dymelectro.dymelectro_backend.service.CatalogoService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;

@RestController
@RequestMapping("/api/catalogo")
public class CatalogoController {

    private final CatalogoService catalogoService;

    public CatalogoController(CatalogoService catalogoService) {
        this.catalogoService = catalogoService;
    }

    @GetMapping
    public ResponseEntity<List<ProductoCatalogoDTO>> listar() {
        return ResponseEntity.ok(catalogoService.listar());
    }

    @GetMapping("/buscar")
    public ResponseEntity<List<ProductoCatalogoDTO>> buscar(@RequestParam String texto) {
        return ResponseEntity.ok(catalogoService.buscar(texto));
    }

    @GetMapping("/filtrar")
    public ResponseEntity<List<ProductoCatalogoDTO>> filtrar(@RequestParam(required = false) Integer idCategoria,
                                                               @RequestParam(required = false) Integer idMarca,
                                                               @RequestParam(required = false) BigDecimal precioMin,
                                                               @RequestParam(required = false) BigDecimal precioMax) {
        return ResponseEntity.ok(catalogoService.filtrar(new FiltroProductoRequest(idCategoria, idMarca, precioMin, precioMax)));
    }

    @GetMapping("/{idProducto}")
    public ResponseEntity<ProductoDetalleDTO> detalle(@PathVariable Integer idProducto) {
        return ResponseEntity.ok(catalogoService.obtenerDetalle(idProducto));
    }

    @PostMapping("/imagenes")
    @PreAuthorize("hasAnyRole('ADMINISTRADOR', 'ALMACENERO')")
    public ResponseEntity<Void> agregarImagen(@Valid @RequestBody AgregarImagenRequest request) {
        catalogoService.agregarImagen(request.idProducto(), request.urlImagen(), request.esPrincipal(), request.orden());
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/imagenes/{idImagen}")
    @PreAuthorize("hasAnyRole('ADMINISTRADOR', 'ALMACENERO')")
    public ResponseEntity<Void> eliminarImagen(@PathVariable Integer idImagen) {
        catalogoService.eliminarImagen(idImagen);
        return ResponseEntity.noContent().build();
    }
}
