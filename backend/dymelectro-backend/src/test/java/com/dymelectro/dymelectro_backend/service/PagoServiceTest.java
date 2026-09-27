package com.dymelectro.dymelectro_backend.service;

import com.dymelectro.dymelectro_backend.dao.PagoDao;
import com.dymelectro.dymelectro_backend.dto.venta.ComprobanteCabeceraDTO;
import com.dymelectro.dymelectro_backend.dto.venta.ComprobanteResponse;
import com.dymelectro.dymelectro_backend.exception.BusinessException;
import com.dymelectro.dymelectro_backend.security.AuthPrincipal;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.Collections;

import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class PagoServiceTest {

    @Mock
    private PagoDao pagoDao;

    @Mock
    private VentaService ventaService;

    @InjectMocks
    private PagoService pagoService;

    @Test
    void crearIntentoPago_ventaYaPagada_lanzaExcepcion() {
        AuthPrincipal solicitante = new AuthPrincipal(1, "cliente@correo.com", "CLIENTE", null);

        ComprobanteCabeceraDTO cabeceraYaPagada = new ComprobanteCabeceraDTO(
                5, "Boleta", "B001", 12, null,
                new BigDecimal("100.00"), new BigDecimal("18.00"), new BigDecimal("118.00"),
                "Pagado", // <- ya no esta 'Pendiente'
                "Juan", "Perez", "DNI", "12345678", null, null
        );
        when(ventaService.obtenerComprobante(5, solicitante))
                .thenReturn(new ComprobanteResponse(cabeceraYaPagada, Collections.emptyList()));

        BusinessException ex = assertThrows(BusinessException.class,
                () -> pagoService.crearIntentoPago(5, solicitante));

        assertTrue(ex.getMessage().contains("no esta pendiente de pago"));
    }
}