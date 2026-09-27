package com.dymelectro.dymelectro_backend.dto.usuario;

import jakarta.validation.constraints.NotNull;

public record CambiarEstadoUsuarioRequest(@NotNull Boolean estado) {}
