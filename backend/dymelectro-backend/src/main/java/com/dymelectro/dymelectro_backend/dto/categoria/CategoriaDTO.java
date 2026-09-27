package com.dymelectro.dymelectro_backend.dto.categoria;

public record CategoriaDTO(
        Integer idCategoria,
        String nombre,
        String descripcion,
        Boolean estado
) {}