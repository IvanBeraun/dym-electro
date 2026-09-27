UPDATE usuarios
SET password = '$2b$10$J8YnnGBj6f61O//NDmcfdebhDtx.bs/JpVEJMzdr5FvjRVFrUglk.'
WHERE email = 'santos.delacruz@dym-electrosolutions.com.pe';

SELECT email, password FROM usuarios WHERE email = 'santos.delacruz@dym-electrosolutions.com.pe';

select * from ventas;

select * from roles;

select * from usuarios;

SELECT * FROM clientes;
SELECT * FROM carrito;

DELIMITER $$

CREATE PROCEDURE sp_listar_ventas()
BEGIN
    SELECT v.id_venta, v.tipo_comprobante, v.serie_comprobante, v.numero_comprobante,
           v.fecha_venta, v.total, v.estado_venta,
           cl.nombres, cl.apellidos, cl.tipo_documento, cl.numero_documento
    FROM ventas v
    INNER JOIN clientes cl ON cl.id_cliente = v.id_cliente
    ORDER BY v.fecha_venta DESC;
END$$

CREATE PROCEDURE sp_listar_compras()
BEGIN
    SELECT c.id_compra, c.fecha_compra, c.total, c.numero_comprobante, pr.razon_social AS proveedor
    FROM compras c
    INNER JOIN proveedores pr ON pr.id_proveedor = c.id_proveedor
    ORDER BY c.fecha_compra DESC;
END$$

DELIMITER ;

SELECT COUNT(*) AS total_clientes FROM clientes;

SHOW PROCEDURE STATUS WHERE Db = 'bd_dym_electro' AND Name IN ('sp_listar_ventas','sp_listar_compras');

SELECT COUNT(*) AS total_proveedores FROM proveedores;

SELECT * FROM productos;

SELECT * FROM producto_imagenes;

SELECT * FROM producto_imagenes WHERE id_producto = 13;

DELETE FROM producto_imagenes WHERE id_imagen = 13;

SELECT * FROM producto_imagenes WHERE id_producto = 6;

DELETE FROM producto_imagenes WHERE id_imagen = 15;

SELECT * FROM producto_imagenes WHERE id_producto = 9;

DELETE FROM producto_imagenes WHERE id_imagen = 16;