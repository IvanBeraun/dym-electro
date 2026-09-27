package com.dymelectro.dymelectro_backend.dao;

import org.springframework.stereotype.Repository;
import java.math.BigDecimal;

@Repository
public class PagoDao {

    private final JdbcProcedureSupport jdbc;

    public PagoDao(JdbcProcedureSupport jdbc) {
        this.jdbc = jdbc;
    }

    public void registrarPago(Integer idVenta, String stripePaymentId, BigDecimal monto, String moneda,
                              String estadoPago, String tarjetaMarca, String tarjetaTipo, String mensajeRespuesta) {
        jdbc.execute("{call sp_registrar_pago_stripe(?,?,?,?,?,?,?,?)}",
                idVenta, stripePaymentId, monto, moneda, estadoPago, tarjetaMarca, tarjetaTipo, mensajeRespuesta);
    }
}