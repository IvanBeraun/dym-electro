package com.dymelectro.dymelectro_backend.dao;

import java.time.LocalDateTime;

public record UsuarioAuthData(
        Integer idUsuario,
        Integer idRol,
        String nombreRol,
        String nombres,
        String apellidos,
        String email,
        String passwordHash,
        Boolean estado,
        Integer intentosFallidos,
        LocalDateTime bloqueadoHasta
) {}
