package com.dymelectro.dymelectro_backend.dto.proveedor;

import java.time.LocalDateTime;

public record ProveedorDTO(
        Integer idProveedor,
        String ruc,
        String razonSocial,
        String telefono,
        String direccion,
        String email,
        LocalDateTime fechaRegistro
) {}