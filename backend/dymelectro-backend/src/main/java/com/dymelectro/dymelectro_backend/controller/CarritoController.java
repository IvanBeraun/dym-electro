package com.dymelectro.dymelectro_backend.controller;

import com.dymelectro.dymelectro_backend.dto.carrito.ActualizarCarritoRequest;
import com.dymelectro.dymelectro_backend.dto.carrito.AgregarCarritoRequest;
import com.dymelectro.dymelectro_backend.dto.carrito.CarritoItemDTO;
import com.dymelectro.dymelectro_backend.security.AuthPrincipal;
import com.dymelectro.dymelectro_backend.service.CarritoService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/carrito")
@PreAuthorize("hasRole('CLIENTE')")
public class CarritoController {

    private final CarritoService carritoService;

    public CarritoController(CarritoService carritoService) {
        this.carritoService = carritoService;
    }

    @GetMapping
    public ResponseEntity<List<CarritoItemDTO>> obtener(@AuthenticationPrincipal AuthPrincipal p) {
        return ResponseEntity.ok(carritoService.obtener(p.id()));
    }

    @PostMapping("/items")
    public ResponseEntity<List<CarritoItemDTO>> agregar(@AuthenticationPrincipal AuthPrincipal p,
                                                          @Valid @RequestBody AgregarCarritoRequest request) {
        return ResponseEntity.ok(carritoService.agregar(p.id(), request.idProducto(), request.cantidad()));
    }

    @PutMapping("/items")
    public ResponseEntity<List<CarritoItemDTO>> actualizar(@AuthenticationPrincipal AuthPrincipal p,
                                                             @Valid @RequestBody ActualizarCarritoRequest request) {
        return ResponseEntity.ok(carritoService.actualizarCantidad(p.id(), request.idProducto(), request.cantidad()));
    }

    @DeleteMapping("/items/{idProducto}")
    public ResponseEntity<List<CarritoItemDTO>> eliminar(@AuthenticationPrincipal AuthPrincipal p,
                                                           @PathVariable Integer idProducto) {
        return ResponseEntity.ok(carritoService.eliminarProducto(p.id(), idProducto));
    }

    @DeleteMapping
    public ResponseEntity<Void> vaciar(@AuthenticationPrincipal AuthPrincipal p) {
        carritoService.vaciar(p.id());
        return ResponseEntity.noContent().build();
    }
}
