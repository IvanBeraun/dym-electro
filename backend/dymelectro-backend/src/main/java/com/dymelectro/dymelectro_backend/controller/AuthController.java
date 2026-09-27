package com.dymelectro.dymelectro_backend.controller;

import com.dymelectro.dymelectro_backend.dto.auth.LoginRequest;
import com.dymelectro.dymelectro_backend.dto.auth.LoginResponse;
import com.dymelectro.dymelectro_backend.dto.auth.RegistroClienteRequest;
import com.dymelectro.dymelectro_backend.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    /** Login para usuarios internos (admin/vendedor/almacenero) del panel administrativo. */
    @PostMapping("/login/usuario")
    public ResponseEntity<LoginResponse> loginUsuario(@Valid @RequestBody LoginRequest request) {
        return ResponseEntity.ok(authService.loginUsuario(request));
    }

    /** Login para clientes de la tienda. */
    @PostMapping("/login/cliente")
    public ResponseEntity<LoginResponse> loginCliente(@Valid @RequestBody LoginRequest request) {
        return ResponseEntity.ok(authService.loginCliente(request));
    }

    /** Registro publico de clientes (crea tambien su carrito, via trigger). */
    @PostMapping("/registro/cliente")
    public ResponseEntity<Map<String, Integer>> registroCliente(@Valid @RequestBody RegistroClienteRequest request) {
        Integer idCliente = authService.registrarCliente(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(Map.of("idCliente", idCliente));
    }
}
