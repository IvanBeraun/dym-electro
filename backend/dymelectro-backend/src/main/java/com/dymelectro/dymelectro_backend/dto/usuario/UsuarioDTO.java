package com.dymelectro.dymelectro_backend.dto.usuario;

import java.time.LocalDateTime;

public record UsuarioDTO(
        Integer idUsuario,
        Integer idRol,
        String nombreRol,
        String nombres,
        String apellidos,
        String email,
        Boolean estado,
        LocalDateTime fechaCreacion
) {}