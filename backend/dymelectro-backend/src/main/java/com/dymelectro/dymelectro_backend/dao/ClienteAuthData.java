package com.dymelectro.dymelectro_backend.dao;

import java.time.LocalDateTime;

public record ClienteAuthData(
        Integer idCliente,
        String tipoDocumento,
        String numeroDocumento,
        String nombres,
        String apellidos,
        String email,
        String passwordHash,
        String telefono,
        String direccion,
        Boolean estado,
        Integer intentosFallidos,
        LocalDateTime bloqueadoHasta
) {}
