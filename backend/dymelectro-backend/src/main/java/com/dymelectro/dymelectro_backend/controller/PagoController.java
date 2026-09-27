package com.dymelectro.dymelectro_backend.controller;

import com.dymelectro.dymelectro_backend.dto.pago.CrearIntentoPagoRequest;
import com.dymelectro.dymelectro_backend.dto.pago.IntentoPagoResponse;
import com.dymelectro.dymelectro_backend.dto.pago.PagoStripeRequest;
import com.dymelectro.dymelectro_backend.security.AuthPrincipal;
import com.dymelectro.dymelectro_backend.service.PagoService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/pagos")
@PreAuthorize("hasRole('CLIENTE')")
public class PagoController {

    private final PagoService pagoService;

    public PagoController(PagoService pagoService) {
        this.pagoService = pagoService;
    }

    /** Paso 1 del checkout: crea el PaymentIntent en Stripe y devuelve el client_secret. */
    @PostMapping("/stripe/intent")
    public ResponseEntity<IntentoPagoResponse> crearIntento(@Valid @RequestBody CrearIntentoPagoRequest request,
                                                            @AuthenticationPrincipal AuthPrincipal solicitante) {
        return ResponseEntity.ok(pagoService.crearIntentoPago(request.idVenta(), solicitante));
    }

    /** Paso 2: una vez que Stripe.js confirma el pago en el navegador, se registra el resultado. */
    @PostMapping("/stripe")
    public ResponseEntity<Void> registrarPago(@Valid @RequestBody PagoStripeRequest request) {
        pagoService.registrarPago(request);
        return ResponseEntity.noContent().build();
    }
}