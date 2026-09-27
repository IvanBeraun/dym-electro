-- Datos de facturacion (RUC + razon social del comprador) para comprobantes tipo Factura.
ALTER TABLE ventas
    ADD COLUMN ruc_facturacion VARCHAR(11) NULL,
    ADD COLUMN razon_social_facturacion VARCHAR(150) NULL;

-- ============================================================
-- sp_generar_venta: agrega p_ruc / p_razon_social (solo se exigen
-- y se guardan cuando el comprobante es Factura).
-- ============================================================
DROP PROCEDURE IF EXISTS sp_generar_venta;

DELIMITER $$
CREATE PROCEDURE sp_generar_venta(
    IN p_id_cliente INT,
    IN p_tipo_comprobante ENUM('Boleta','Factura'),
    IN p_ruc VARCHAR(11),
    IN p_razon_social VARCHAR(150)
)
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

    IF p_tipo_comprobante = 'Factura' THEN
        IF p_ruc IS NULL OR CHAR_LENGTH(p_ruc) <> 11 THEN
            SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Para Factura se requiere un RUC valido de 11 digitos';
        END IF;
        IF p_razon_social IS NULL OR TRIM(p_razon_social) = '' THEN
            SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Para Factura se requiere la razon social';
        END IF;
    END IF;

    START TRANSACTION;

    SELECT id_carrito INTO v_id_carrito FROM carrito WHERE id_cliente = p_id_cliente;
    SELECT COUNT(*) INTO v_items FROM detalle_carrito WHERE id_carrito = v_id_carrito;
    IF v_items = 0 THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'El carrito está vacío, no se puede generar la venta';
    END IF;

    SELECT SUM(dc.cantidad * p.precio_venta) INTO v_subtotal
    FROM detalle_carrito dc INNER JOIN productos p ON p.id_producto = dc.id_producto
    WHERE dc.id_carrito = v_id_carrito;

    SET v_igv = ROUND(v_subtotal * 0.18, 2);
    SET v_total = v_subtotal + v_igv;

    SELECT serie, ultimo_numero + 1 INTO v_serie, v_numero
    FROM correlativos_comprobante WHERE tipo_comprobante = p_tipo_comprobante FOR UPDATE;
    UPDATE correlativos_comprobante SET ultimo_numero = v_numero WHERE tipo_comprobante = p_tipo_comprobante;

    INSERT INTO ventas (id_cliente, subtotal, igv, total, estado_venta, tipo_comprobante,
                         serie_comprobante, numero_comprobante, ruc_facturacion, razon_social_facturacion)
    VALUES (p_id_cliente, v_subtotal, v_igv, v_total, 'Pendiente', p_tipo_comprobante, v_serie, v_numero,
            IF(p_tipo_comprobante = 'Factura', p_ruc, NULL),
            IF(p_tipo_comprobante = 'Factura', p_razon_social, NULL));
    SET v_id_venta = LAST_INSERT_ID();

    OPEN cur;
    bucle: LOOP
        FETCH cur INTO v_id_producto, v_cantidad, v_precio;
        IF v_done THEN LEAVE bucle; END IF;
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

-- ============================================================
-- sp_obtener_comprobante: agrega ruc_facturacion / razon_social_facturacion
-- (mantiene el JOIN con pagos_stripe que ya tenías).
-- ============================================================
DROP PROCEDURE IF EXISTS sp_obtener_comprobante;

DELIMITER $$
CREATE PROCEDURE sp_obtener_comprobante(IN p_id_venta INT)
BEGIN
    SELECT v.id_venta, v.tipo_comprobante, v.serie_comprobante, v.numero_comprobante, v.fecha_venta,
           v.subtotal, v.igv, v.total, v.estado_venta,
           cl.nombres, cl.apellidos, cl.tipo_documento, cl.numero_documento,
           v.ruc_facturacion, v.razon_social_facturacion,
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

-- ============================================================
-- sp_listar_ventas: mismo agregado, para que el panel admin tambien
-- pueda ver a nombre de que RUC se facturo.
-- ============================================================
DROP PROCEDURE IF EXISTS sp_listar_ventas;

DELIMITER $$
CREATE PROCEDURE sp_listar_ventas()
BEGIN
    SELECT v.id_venta, v.tipo_comprobante, v.serie_comprobante, v.numero_comprobante,
           v.fecha_venta, v.subtotal, v.igv, v.total, v.estado_venta,
           cl.nombres, cl.apellidos, cl.tipo_documento, cl.numero_documento,
           v.ruc_facturacion, v.razon_social_facturacion
    FROM ventas v INNER JOIN clientes cl ON cl.id_cliente = v.id_cliente
    ORDER BY v.fecha_venta DESC;
END$$
DELIMITER ;

select * from clientes;

-- =============================================================================================

USE bd_dym_electro;

INSERT INTO proveedores (ruc, razon_social, telefono, direccion, email) VALUES
('20123456789', 'Distribuidora Eléctrica Schneider del Perú S.A.C.',      '(01) 517-9000', 'Av. República de Panamá 3050, San Isidro, Lima',     'ventas@schneiderdist.pe'),
('20512345678', 'Hikvision Perú Tecnología y Seguridad E.I.R.L.',        '(01) 619-6200', 'Av. Javier Prado Este 5400, La Molina, Lima',        'comercial@hikvisionperu.com'),
('20345678901', 'Climatización Industrial York & Carrier S.A.C.',       '(01) 441-2345', 'Jr. Los Olivos 412, Lince, Lima',                    'pedidos@climaindustrial.com.pe'),
('20678901234', 'Bosch Fire Safety Solutions del Perú S.R.L.',          '(01) 315-8600', 'Av. Canaval y Moreyra 480, San Isidro, Lima',       'boschfuego@bsfsperu.com'),
('20156789012', 'Automatización Industrial Siemens Andina S.A.C.',      '(01) 611-7800', 'Av. El Derby 254, Surco, Lima',                     'automation@siemensandina.pe'),
('20456789012', 'Metales y Estructuras DymPeru E.I.R.L.',               '(01) 785-1234', 'Av. Argentina 2010, Callao',                         'ventas@dymperuestructuras.com'),
('20234567890', 'Tecnodata Redes y Telecomunicaciones S.A.C.',         '(01) 452-8890', 'Calle Los Pinos 150, Pueblo Libre, Lima',           'ventas@tecnodata.com.pe');

select * from proveedores;

-- ==============================================================================================

DROP PROCEDURE IF EXISTS sp_eliminar_imagen_producto;

DELIMITER $$
CREATE PROCEDURE sp_eliminar_imagen_producto(IN p_id_imagen INT)
BEGIN
    DECLARE v_id_producto INT;
    DECLARE v_era_principal TINYINT;
    DECLARE v_siguiente_imagen INT;

    SELECT id_producto, es_principal INTO v_id_producto, v_era_principal
    FROM producto_imagenes WHERE id_imagen = p_id_imagen;

    DELETE FROM producto_imagenes WHERE id_imagen = p_id_imagen;

    -- Si la imagen borrada era la principal, se promueve otra automaticamente
    -- (la de menor "orden"), para que el producto no quede sin foto en el catalogo.
    IF v_era_principal = 1 THEN
        SELECT id_imagen INTO v_siguiente_imagen
        FROM producto_imagenes
        WHERE id_producto = v_id_producto
        ORDER BY orden ASC, id_imagen ASC
        LIMIT 1;

        IF v_siguiente_imagen IS NOT NULL THEN
            UPDATE producto_imagenes SET es_principal = 1 WHERE id_imagen = v_siguiente_imagen;
        END IF;
    END IF;
END$$
DELIMITER ;