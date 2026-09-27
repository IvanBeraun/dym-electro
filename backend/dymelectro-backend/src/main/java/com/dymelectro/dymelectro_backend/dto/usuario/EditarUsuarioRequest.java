package com.dymelectro.dymelectro_backend.dto.usuario;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record EditarUsuarioRequest(
        @NotNull Integer idRol,
        @NotBlank String nombres,
        @NotBlank String apellidos,
        @NotBlank @Email String email
) {}
