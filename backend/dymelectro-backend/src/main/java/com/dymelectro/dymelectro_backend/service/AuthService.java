package com.dymelectro.dymelectro_backend.service;

import com.dymelectro.dymelectro_backend.dao.ClienteAuthData;
import com.dymelectro.dymelectro_backend.dao.ClienteDao;
import com.dymelectro.dymelectro_backend.dao.UsuarioAuthData;
import com.dymelectro.dymelectro_backend.dao.UsuarioDao;
import com.dymelectro.dymelectro_backend.dto.auth.LoginRequest;
import com.dymelectro.dymelectro_backend.dto.auth.LoginResponse;
import com.dymelectro.dymelectro_backend.dto.auth.RegistroClienteRequest;
import com.dymelectro.dymelectro_backend.exception.AccountLockedException;
import com.dymelectro.dymelectro_backend.security.JwtUtil;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Map;

@Service
public class AuthService {

    private final UsuarioDao usuarioDao;
    private final ClienteDao clienteDao;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    public AuthService(UsuarioDao usuarioDao, ClienteDao clienteDao, PasswordEncoder passwordEncoder, JwtUtil jwtUtil) {
        this.usuarioDao = usuarioDao;
        this.clienteDao = clienteDao;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtil = jwtUtil;
    }

    public LoginResponse loginUsuario(LoginRequest request) {
        UsuarioAuthData usuario = usuarioDao.obtenerPorEmail(request.email())
                .orElseThrow(() -> new BadCredentialsException("Credenciales invalidas"));

        verificarBloqueo(usuario.bloqueadoHasta());

        if (!Boolean.TRUE.equals(usuario.estado())) {
            throw new BadCredentialsException("La cuenta esta deshabilitada");
        }

        if (!passwordEncoder.matches(request.password(), usuario.passwordHash())) {
            usuarioDao.registrarFalloLogin(request.email());
            throw new BadCredentialsException("Credenciales invalidas");
        }

        usuarioDao.loginExitoso(request.email());

        String token = jwtUtil.generateToken(usuario.email(), Map.of(
                "id", usuario.idUsuario(),
                "tipoCuenta", "USUARIO",
                "rol", usuario.nombreRol()
        ));

        return new LoginResponse(token, "USUARIO", usuario.idUsuario(), usuario.nombres(), usuario.apellidos(), usuario.nombreRol());
    }

    public LoginResponse loginCliente(LoginRequest request) {
        ClienteAuthData cliente = clienteDao.obtenerPorEmail(request.email())
                .orElseThrow(() -> new BadCredentialsException("Credenciales invalidas"));

        verificarBloqueo(cliente.bloqueadoHasta());

        if (!Boolean.TRUE.equals(cliente.estado())) {
            throw new BadCredentialsException("La cuenta esta deshabilitada");
        }

        if (!passwordEncoder.matches(request.password(), cliente.passwordHash())) {
            clienteDao.registrarFalloLogin(request.email());
            throw new BadCredentialsException("Credenciales invalidas");
        }

        clienteDao.loginExitoso(request.email());

        String token = jwtUtil.generateToken(cliente.email(), Map.of(
                "id", cliente.idCliente(),
                "tipoCuenta", "CLIENTE",
                "rol", ""
        ));

        return new LoginResponse(token, "CLIENTE", cliente.idCliente(), cliente.nombres(), cliente.apellidos(), null);
    }

    public Integer registrarCliente(RegistroClienteRequest request) {
        String hash = passwordEncoder.encode(request.password());
        return clienteDao.registrarCliente(
                request.tipoDocumento(), request.numeroDocumento(), request.nombres(), request.apellidos(),
                request.email(), hash, request.telefono(), request.direccion());
    }

    private void verificarBloqueo(LocalDateTime bloqueadoHasta) {
        if (bloqueadoHasta != null && bloqueadoHasta.isAfter(LocalDateTime.now())) {
            String hasta = bloqueadoHasta.format(DateTimeFormatter.ofPattern("HH:mm:ss"));
            throw new AccountLockedException("Cuenta bloqueada por demasiados intentos fallidos. Intenta de nuevo despues de las " + hasta);
        }
    }
}
