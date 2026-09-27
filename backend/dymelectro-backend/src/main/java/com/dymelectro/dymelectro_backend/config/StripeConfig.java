package com.dymelectro.dymelectro_backend.config;

import com.stripe.Stripe;
import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

/** Inicializa el SDK de Stripe con la llave secreta al arrancar la app. */
@Component
public class StripeConfig {

    @Value("${stripe.secret-key}")
    private String stripeSecretKey;

    @PostConstruct
    public void inicializar() {
        Stripe.apiKey = stripeSecretKey;
    }
}