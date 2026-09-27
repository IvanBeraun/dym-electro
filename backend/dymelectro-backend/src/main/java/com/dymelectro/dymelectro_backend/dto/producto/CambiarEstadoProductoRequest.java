package com.dymelectro.dymelectro_backend.dto.producto;

import jakarta.validation.constraints.NotNull;

public record CambiarEstadoProductoRequest(@NotNull Boolean estado) {}