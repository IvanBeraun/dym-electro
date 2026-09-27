package com.dymelectro.dymelectro_backend.controller;

import com.dymelectro.dymelectro_backend.dto.cliente.ClienteDTO;
import com.dymelectro.dymelectro_backend.dto.cliente.EditarClienteRequest;
import com.dymelectro.dymelectro_backend.security.AuthPrincipal;
import com.dymelectro.dymelectro_backend.service.ClienteService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/clientes")
@PreAuthorize("hasRole('CLIENTE')")
public class ClienteController {

    private final ClienteService clienteService;

    public ClienteController(ClienteService clienteService) {
        this.clienteService = clienteService;
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMINISTRADOR')")
    public ResponseEntity<List<ClienteDTO>> listar() {
        return ResponseEntity.ok(clienteService.listarTodos());
    }

    @GetMapping("/me")
    public ResponseEntity<ClienteDTO> yo(@AuthenticationPrincipal AuthPrincipal principal) {
        return ResponseEntity.ok(clienteService.obtenerPorEmail(principal.email()));
    }

    @PutMapping("/me")
    public ResponseEntity<Void> editarMiPerfil(@AuthenticationPrincipal AuthPrincipal principal,
                                                @Valid @RequestBody EditarClienteRequest request) {
        clienteService.editar(principal.id(), request);
        return ResponseEntity.noContent().build();
    }
}
