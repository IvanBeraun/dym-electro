package com.dymelectro.dymelectro_backend.dto.marca;

public record MarcaDTO(
        Integer idMarca,
        String nombre,
        String descripcion,
        Boolean estado
) {}