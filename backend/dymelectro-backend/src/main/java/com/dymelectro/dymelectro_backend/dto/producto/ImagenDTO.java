package com.dymelectro.dymelectro_backend.dto.producto;

public record ImagenDTO(
        Integer idImagen,
        String urlImagen,
        Boolean esPrincipal,
        Integer orden
) {}
