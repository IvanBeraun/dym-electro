package com.dymelectro.dymelectro_backend.dto.producto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

public record AjustarStockRequest(@NotNull @Min(0) Integer stock) {}