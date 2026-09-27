-- ============================================================================
-- MIGRACION: IGV diferenciado por tipo de comprobante
-- Boleta -> 0% IGV | Factura -> 18% IGV
-- Corre esto UNA VEZ, DESPUES de migracion_stripe.sql, contra tu base de
-- datos actual. Agrega columnas nuevas y regenera los SPs de ventas.
-- ============================================================================

-- 1) Nuevas columnas en ventas: separan lo que ya se cobraba (total) en
--    subtotal (sin IGV) + igv. "total" se mantiene como el monto final
--    (subtotal + igv), asi que nada que ya use "total" se rompe.
ALTER TABLE ventas
    ADD COLUMN subtotal DECIMAL(10,2) NOT NULL DEFAULT 0 AFTER id_cliente,
    ADD COLUMN igv DECIMAL(10,2) NOT NULL DEFAULT 0 AFTER subtotal;

-- Ventas ya existentes (creadas antes de este cambio): se asume que su
-- "total" ya guardado equivalia al subtotal, sin IGV discriminado.

SET SQL_SAFE_UPDATES = 0;

UPDATE ventas SET subtotal = total, igv = 0 WHERE subtotal = 0;

SET SQL_SAFE_UPDATES = 1;

-- 2) sp_generar_venta: ahora calcula subtotal + igv (18% solo si es Factura)
--    y los guarda en la cabecera de la venta.
DROP PROCEDURE IF EXISTS sp_generar_venta;

DELIMITER $$
CREATE PROCEDURE sp_generar_venta(IN p_id_cliente INT, IN p_tipo_comprobante ENUM('Boleta','Factura'))
BEGIN
    DECLARE v_id_carrito INT;
    DECLARE v_subtotal DECIMAL(10,2) DEFAULT 0;
    DECLARE v_porcentaje_igv DECIMAL(4,2);
    DECLARE v_igv DECIMAL(10,2);
    DECLARE v_total DECIMAL(10,2);
    DECLARE v_id_venta INT;
    DECLARE v_serie VARCHAR(4);
    DECLARE v_numero INT;
    DECLARE v_items INT;

    DECLARE v_done INT DEFAULT FALSE;
    DECLARE v_id_producto INT;
    DECLARE v_cantidad INT;
    DECLARE v_precio DECIMAL(10,2);

    DECLARE cur CURSOR FOR
        SELECT dc.id_producto, dc.cantidad, p.precio_venta
        FROM detalle_carrito dc INNER JOIN productos p ON p.id_producto = dc.id_producto
        WHERE dc.id_carrito = v_id_carrito;
    DECLARE CONTINUE HANDLER FOR NOT FOUND SET v_done = TRUE;
    DECLARE EXIT HANDLER FOR SQLEXCEPTION BEGIN ROLLBACK; RESIGNAL; END;

    START TRANSACTION;

    SELECT id_carrito INTO v_id_carrito FROM carrito WHERE id_cliente = p_id_cliente;
    SELECT COUNT(*) INTO v_items FROM detalle_carrito WHERE id_carrito = v_id_carrito;
    IF v_items = 0 THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'El carrito está vacío, no se puede generar la venta';
    END IF;

    SELECT SUM(dc.cantidad * p.precio_venta) INTO v_subtotal
    FROM detalle_carrito dc INNER JOIN productos p ON p.id_producto = dc.id_producto
    WHERE dc.id_carrito = v_id_carrito;

    SET v_porcentaje_igv = IF(p_tipo_comprobante = 'Factura', 0.18, 0.00);
    SET v_igv = ROUND(v_subtotal * v_porcentaje_igv, 2);
    SET v_total = v_subtotal + v_igv;

    SELECT serie, ultimo_numero + 1 INTO v_serie, v_numero
    FROM correlativos_comprobante WHERE tipo_comprobante = p_tipo_comprobante FOR UPDATE;
    UPDATE correlativos_comprobante SET ultimo_numero = v_numero WHERE tipo_comprobante = p_tipo_comprobante;

    INSERT INTO ventas (id_cliente, subtotal, igv, total, estado_venta, tipo_comprobante, serie_comprobante, numero_comprobante)
    VALUES (p_id_cliente, v_subtotal, v_igv, v_total, 'Pendiente', p_tipo_comprobante, v_serie, v_numero);
    SET v_id_venta = LAST_INSERT_ID();

    OPEN cur;
    bucle: LOOP
        FETCH cur INTO v_id_producto, v_cantidad, v_precio;
        IF v_done THEN
            LEAVE bucle;
        END IF;
        INSERT INTO detalle_ventas (id_venta, id_producto, cantidad, precio_venta, subtotal)
        VALUES (v_id_venta, v_id_producto, v_cantidad, v_precio, v_cantidad * v_precio);
    END LOOP;
    CLOSE cur;

    DELETE FROM detalle_carrito WHERE id_carrito = v_id_carrito;

    COMMIT;

    SELECT v_id_venta AS id_venta, v_serie AS serie, v_numero AS numero,
           v_subtotal AS subtotal, v_igv AS igv, v_total AS total;
END$$
DELIMITER ;

-- 3) sp_obtener_comprobante: agrega subtotal e igv a la cabecera devuelta.
DROP PROCEDURE IF EXISTS sp_obtener_comprobante;

DELIMITER $$
CREATE PROCEDURE sp_obtener_comprobante(IN p_id_venta INT)
BEGIN
    SELECT v.id_venta, v.tipo_comprobante, v.serie_comprobante, v.numero_comprobante, v.fecha_venta,
           v.subtotal, v.igv, v.total, v.estado_venta,
           cl.nombres, cl.apellidos, cl.tipo_documento, cl.numero_documento
    FROM ventas v INNER JOIN clientes cl ON cl.id_cliente = v.id_cliente
    WHERE v.id_venta = p_id_venta;

    SELECT dv.id_producto, p.nombre, dv.cantidad, dv.precio_venta, dv.subtotal
    FROM detalle_ventas dv INNER JOIN productos p ON p.id_producto = dv.id_producto
    WHERE dv.id_venta = p_id_venta;
END$$
DELIMITER ;

-- 4) sp_listar_ventas y sp_historial_ventas_cliente: mismo agregado, para que
--    el panel admin y "mis compras" del cliente tambien puedan mostrar el
--    desglose si se quiere.
DROP PROCEDURE IF EXISTS sp_listar_ventas;

DELIMITER $$
CREATE PROCEDURE sp_listar_ventas()
BEGIN
    SELECT v.id_venta, v.tipo_comprobante, v.serie_comprobante, v.numero_comprobante,
           v.fecha_venta, v.subtotal, v.igv, v.total, v.estado_venta,
           cl.nombres, cl.apellidos, cl.tipo_documento, cl.numero_documento
    FROM ventas v INNER JOIN clientes cl ON cl.id_cliente = v.id_cliente
    ORDER BY v.fecha_venta DESC;
END$$
DELIMITER ;

DROP PROCEDURE IF EXISTS sp_historial_ventas_cliente;

DELIMITER $$
CREATE PROCEDURE sp_historial_ventas_cliente(IN p_id_cliente INT)
BEGIN
    SELECT id_venta, tipo_comprobante, serie_comprobante, numero_comprobante, fecha_venta,
           subtotal, igv, total, estado_venta
    FROM ventas WHERE id_cliente = p_id_cliente ORDER BY fecha_venta DESC;
END$$
DELIMITER ;

select * from clientes;

ALTER TABLE pagos_stripe
    CHANGE COLUMN tarjeta_tipo tarjeta_ultimos4 VARCHAR(10);
    
DROP PROCEDURE IF EXISTS sp_obtener_comprobante;

DELIMITER $$
CREATE PROCEDURE sp_obtener_comprobante(IN p_id_venta INT)
BEGIN
    SELECT v.id_venta, v.tipo_comprobante, v.serie_comprobante, v.numero_comprobante, v.fecha_venta,
           v.subtotal, v.igv, v.total, v.estado_venta,
           cl.nombres, cl.apellidos, cl.tipo_documento, cl.numero_documento,
           pg.tarjeta_marca, pg.tarjeta_ultimos4
    FROM ventas v
    INNER JOIN clientes cl ON cl.id_cliente = v.id_cliente
    LEFT JOIN (
        SELECT id_venta, tarjeta_marca, tarjeta_ultimos4
        FROM pagos_stripe
        WHERE id_venta = p_id_venta
        ORDER BY fecha_pago DESC
        LIMIT 1
    ) pg ON pg.id_venta = v.id_venta
    WHERE v.id_venta = p_id_venta;

    SELECT dv.id_producto, p.nombre, dv.cantidad, dv.precio_venta, dv.subtotal
    FROM detalle_ventas dv INNER JOIN productos p ON p.id_producto = dv.id_producto
    WHERE dv.id_venta = p_id_venta;
END$$
DELIMITER ;

-- ===================================================================================================

DROP PROCEDURE IF EXISTS sp_registrar_pago_stripe;

DELIMITER $$
CREATE PROCEDURE sp_registrar_pago_stripe(
    IN p_id_venta INT, IN p_stripe_payment_id VARCHAR(120), IN p_monto DECIMAL(10,2),
    IN p_moneda VARCHAR(10), IN p_estado_pago VARCHAR(50), IN p_tarjeta_marca VARCHAR(50),
    IN p_tarjeta_ultimos4 VARCHAR(10), IN p_mensaje_respuesta VARCHAR(255)
)
BEGIN
    INSERT INTO pagos_stripe (id_venta, stripe_payment_id, monto, moneda, estado_pago, tarjeta_marca, tarjeta_ultimos4, mensaje_respuesta)
    VALUES (p_id_venta, p_stripe_payment_id, p_monto, p_moneda, p_estado_pago, p_tarjeta_marca, p_tarjeta_ultimos4, p_mensaje_respuesta);
    IF p_estado_pago = 'successful' THEN
        UPDATE ventas SET estado_venta = 'Pagado' WHERE id_venta = p_id_venta;
    ELSE
        UPDATE ventas SET estado_venta = 'Rechazado' WHERE id_venta = p_id_venta;
    END IF;
END$$
DELIMITER ;