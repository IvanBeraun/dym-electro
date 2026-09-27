package com.dymelectro.dymelectro_backend.service;

import com.dymelectro.dymelectro_backend.dao.PagoDao;
import com.dymelectro.dymelectro_backend.dto.pago.IntentoPagoResponse;
import com.dymelectro.dymelectro_backend.dto.pago.PagoStripeRequest;
import com.dymelectro.dymelectro_backend.dto.venta.ComprobanteResponse;
import com.dymelectro.dymelectro_backend.exception.BusinessException;
import com.dymelectro.dymelectro_backend.security.AuthPrincipal;
import com.stripe.exception.StripeException;
import com.stripe.model.PaymentIntent;
import com.stripe.model.PaymentMethod;
import com.stripe.param.PaymentIntentCreateParams;
import com.stripe.param.PaymentIntentRetrieveParams;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;

@Service
public class PagoService {

    private final PagoDao pagoDao;
    private final VentaService ventaService;

    @Value("${stripe.currency}")
    private String moneda;

    public PagoService(PagoDao pagoDao, VentaService ventaService) {
        this.pagoDao = pagoDao;
        this.ventaService = ventaService;
    }

    public IntentoPagoResponse crearIntentoPago(Integer idVenta, AuthPrincipal solicitante) {
        ComprobanteResponse comprobante = ventaService.obtenerComprobante(idVenta, solicitante);
        String estado = comprobante.cabecera().estadoVenta();
        if (!"Pendiente".equals(estado)) {
            throw new BusinessException("La venta " + idVenta + " no esta pendiente de pago (estado actual: " + estado + ")");
        }

        BigDecimal total = comprobante.cabecera().total();
        long montoEnCentavos = total.setScale(2, RoundingMode.HALF_UP)
                .multiply(BigDecimal.valueOf(100))
                .longValueExact();

        PaymentIntentCreateParams params = PaymentIntentCreateParams.builder()
                .setAmount(montoEnCentavos)
                .setCurrency(moneda)
                .putMetadata("idVenta", String.valueOf(idVenta))
                .setAutomaticPaymentMethods(
                        PaymentIntentCreateParams.AutomaticPaymentMethods.builder().setEnabled(true).build()
                )
                .build();

        try {
            PaymentIntent intent = PaymentIntent.create(params);
            return new IntentoPagoResponse(intent.getClientSecret(), idVenta, total, moneda);
        } catch (StripeException e) {
            throw new BusinessException("No se pudo crear el intento de pago en Stripe: " + e.getMessage(), e);
        }
    }

    public void registrarPago(PagoStripeRequest req) {
        String[] datosTarjeta = obtenerDatosTarjeta(req.stripePaymentId());
        // El SP actualiza el estado de la venta a 'Pagado' o 'Rechazado' segun estadoPago.
        pagoDao.registrarPago(req.idVenta(), req.stripePaymentId(), req.monto(), req.moneda(),
                req.estadoPago(), datosTarjeta[0], datosTarjeta[1], req.mensajeRespuesta());
    }

    /**
     * Consulta a Stripe (no al navegador) la marca y ultimos 4 digitos reales
     * de la tarjeta usada, a partir del PaymentIntent ya confirmado.
     * Devuelve [marca, ultimos4]; ambos null si no se puede obtener el detalle
     * (no bloquea el registro del pago si esto falla).
     */
    private String[] obtenerDatosTarjeta(String paymentIntentId) {
        try {
            PaymentIntentRetrieveParams params = PaymentIntentRetrieveParams.builder()
                    .addExpand("payment_method")
                    .build();
            PaymentIntent intent = PaymentIntent.retrieve(paymentIntentId, params, null);
            PaymentMethod metodo = intent.getPaymentMethodObject();
            if (metodo != null && metodo.getCard() != null) {
                String marca = capitalizar(metodo.getCard().getBrand());
                String ultimos4 = metodo.getCard().getLast4();
                return new String[] { marca, ultimos4 };
            }
        } catch (StripeException e) {
            // No se pudo obtener el detalle de la tarjeta; el pago se registra igual.
        }
        return new String[] { null, null };
    }

    private String capitalizar(String texto) {
        if (texto == null || texto.isBlank()) return texto;
        return texto.substring(0, 1).toUpperCase() + texto.substring(1);
    }
}