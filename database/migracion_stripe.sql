-- ============================================================================
-- MIGRACION: pagos_culqi -> pagos_stripe
-- Corre esto UNA VEZ contra tu base de datos actual (la que ya tienes
-- corriendo). No borra ningun dato de pagos_culqi, solo la renombra.
-- ============================================================================

ALTER TABLE pagos_culqi RENAME TO pagos_stripe;
ALTER TABLE pagos_stripe
    CHANGE COLUMN culqi_charge_id stripe_payment_id VARCHAR(120) UNIQUE NOT NULL;

DROP PROCEDURE IF EXISTS sp_registrar_pago_culqi;

DELIMITER $$
CREATE PROCEDURE sp_registrar_pago_stripe(
    IN p_id_venta INT, IN p_stripe_payment_id VARCHAR(120), IN p_monto DECIMAL(10,2),
    IN p_moneda VARCHAR(10), IN p_estado_pago VARCHAR(50), IN p_tarjeta_marca VARCHAR(50),
    IN p_tarjeta_tipo VARCHAR(30), IN p_mensaje_respuesta VARCHAR(255)
)
BEGIN
    INSERT INTO pagos_stripe (id_venta, stripe_payment_id, monto, moneda, estado_pago, tarjeta_marca, tarjeta_tipo, mensaje_respuesta)
    VALUES (p_id_venta, p_stripe_payment_id, p_monto, p_moneda, p_estado_pago, p_tarjeta_marca, p_tarjeta_tipo, p_mensaje_respuesta);
    IF p_estado_pago = 'successful' THEN
        UPDATE ventas SET estado_venta = 'Pagado' WHERE id_venta = p_id_venta;
    ELSE
        UPDATE ventas SET estado_venta = 'Rechazado' WHERE id_venta = p_id_venta;
    END IF;
END$$
DELIMITER ;

SHOW INDEX FROM pagos_stripe;
ALTER TABLE pagos_stripe DROP INDEX culqi_charge_id;