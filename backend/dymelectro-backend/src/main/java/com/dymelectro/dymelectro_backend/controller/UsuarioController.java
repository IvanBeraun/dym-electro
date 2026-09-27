package com.dymelectro.dymelectro_backend.controller;

import com.dymelectro.dymelectro_backend.dto.usuario.CambiarEstadoUsuarioRequest;
import com.dymelectro.dymelectro_backend.dto.usuario.CrearUsuarioRequest;
import com.dymelectro.dymelectro_backend.dto.usuario.EditarUsuarioRequest;
import com.dymelectro.dymelectro_backend.dto.usuario.UsuarioDTO;
import com.dymelectro.dymelectro_backend.security.AuthPrincipal;
import com.dymelectro.dymelectro_backend.service.UsuarioService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/usuarios")
@PreAuthorize("hasRole('ADMINISTRADOR')")
public class UsuarioController {

    private final UsuarioService usuarioService;

    public UsuarioController(UsuarioService usuarioService) {
        this.usuarioService = usuarioService;
    }

    @GetMapping
    public ResponseEntity<List<UsuarioDTO>> listar() {
        return ResponseEntity.ok(usuarioService.listarTodos());
    }

    @PostMapping
    public ResponseEntity<Map<String, Integer>> crear(@Valid @RequestBody CrearUsuarioRequest request) {
        Integer id = usuarioService.crear(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(Map.of("idUsuario", id));
    }

    @PutMapping("/{idUsuario}")
    public ResponseEntity<Void> editar(@PathVariable Integer idUsuario, @Valid @RequestBody EditarUsuarioRequest request) {
        usuarioService.editar(idUsuario, request);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/{idUsuario}/estado")
    public ResponseEntity<Void> cambiarEstado(@PathVariable Integer idUsuario, @Valid @RequestBody CambiarEstadoUsuarioRequest request) {
        usuarioService.cambiarEstado(idUsuario, request.estado());
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/me")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<UsuarioDTO> yo(@AuthenticationPrincipal AuthPrincipal principal) {
        return ResponseEntity.ok(usuarioService.obtenerPorEmail(principal.email()));
    }
}
