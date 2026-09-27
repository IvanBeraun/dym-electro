package com.dymelectro.dymelectro_backend.dto.cliente;

import java.time.LocalDateTime;

public record ClienteDTO(
        Integer idCliente,
        String tipoDocumento,
        String numeroDocumento,
        String nombres,
        String apellidos,
        String email,
        String telefono,
        String direccion,
        Boolean estado,
        LocalDateTime fechaRegistro
) {}