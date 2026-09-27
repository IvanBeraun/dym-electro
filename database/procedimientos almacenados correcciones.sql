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

-- ===================================================================================================================

DROP PROCEDURE IF EXISTS sp_cancelar_venta_pendiente;

DELIMITER $$
CREATE PROCEDURE sp_cancelar_venta_pendiente(IN p_id_venta INT, IN p_id_cliente INT)
BEGIN
    DECLARE v_estado VARCHAR(20);
    DECLARE v_dueno INT;
    DECLARE v_id_carrito INT;

    DECLARE v_done INT DEFAULT FALSE;
    DECLARE v_id_producto INT;
    DECLARE v_cantidad INT;

    DECLARE cur CURSOR FOR
        SELECT id_producto, cantidad FROM detalle_ventas WHERE id_venta = p_id_venta;
    DECLARE CONTINUE HANDLER FOR NOT FOUND SET v_done = TRUE;
    DECLARE EXIT HANDLER FOR SQLEXCEPTION BEGIN ROLLBACK; RESIGNAL; END;

    SELECT estado_venta, id_cliente INTO v_estado, v_dueno FROM ventas WHERE id_venta = p_id_venta;

    IF v_dueno IS NULL THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'La venta no existe';
    ELSEIF v_dueno <> p_id_cliente THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Esta venta no pertenece al cliente autenticado';
    ELSEIF v_estado <> 'Pendiente' THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Solo se puede cancelar una venta que este Pendiente de pago';
    ELSE
        START TRANSACTION;

        SELECT id_carrito INTO v_id_carrito FROM carrito WHERE id_cliente = p_id_cliente;

        OPEN cur;
        bucle: LOOP
            FETCH cur INTO v_id_producto, v_cantidad;
            IF v_done THEN
                LEAVE bucle;
            END IF;
            INSERT INTO detalle_carrito (id_carrito, id_producto, cantidad)
            VALUES (v_id_carrito, v_id_producto, v_cantidad)
            ON DUPLICATE KEY UPDATE cantidad = cantidad + v_cantidad;
        END LOOP;
        CLOSE cur;

        UPDATE ventas SET estado_venta = 'Anulado' WHERE id_venta = p_id_venta;

        COMMIT;
    END IF;
END$$
DELIMITER ;

-- ===================================================================================================================

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

-- ====================================================================================================================

SHOW CREATE PROCEDURE sp_listar_ventas;

-- ====================================================================================================================

-- ============================================================================
-- CORRECCION: IGV 18% para Boleta Y Factura (no solo Factura)
-- Corre esto UNA VEZ. Solo cambia la logica de calculo de IGV en sp_generar_venta.
-- ============================================================================

DROP PROCEDURE IF EXISTS sp_generar_venta;

DELIMITER $$
CREATE PROCEDURE sp_generar_venta(IN p_id_cliente INT, IN p_tipo_comprobante ENUM('Boleta','Factura'))
BEGIN
    DECLARE v_id_carrito INT;
    DECLARE v_subtotal DECIMAL(10,2) DEFAULT 0;
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

    -- IGV 18% siempre, sin importar el tipo de comprobante (Boleta o Factura).
    SET v_igv = ROUND(v_subtotal * 0.18, 2);
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