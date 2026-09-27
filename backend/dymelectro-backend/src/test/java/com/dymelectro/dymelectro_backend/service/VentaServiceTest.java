package com.dymelectro.dymelectro_backend.service;

import com.dymelectro.dymelectro_backend.dao.VentaDao;
import com.dymelectro.dymelectro_backend.exception.BusinessException;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.verifyNoInteractions;

@ExtendWith(MockitoExtension.class)
class VentaServiceTest {

    @Mock
    private VentaDao ventaDao;

    @Mock
    private ComprobantePdfService comprobantePdfService;

    @InjectMocks
    private VentaService ventaService;

    @Test
    void generarVenta_facturaSinRuc_lanzaExcepcionYNoLlegaALaBD() {
        BusinessException ex = assertThrows(BusinessException.class,
                () -> ventaService.generarVenta(1, "Factura", null, "Empresa SAC"));

        assertEquals("Para Factura debes indicar el RUC del comprador", ex.getMessage());
        verifyNoInteractions(ventaDao); // nunca debe intentar tocar la base de datos
    }

    @Test
    void generarVenta_facturaSinRazonSocial_lanzaExcepcionYNoLlegaALaBD() {
        BusinessException ex = assertThrows(BusinessException.class,
                () -> ventaService.generarVenta(1, "Factura", "20603140037", "   "));

        assertEquals("Para Factura debes indicar la razón social del comprador", ex.getMessage());
        verifyNoInteractions(ventaDao);
    }
}