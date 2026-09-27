DROP DATABASE IF EXISTS bd_dym_electro;
CREATE DATABASE bd_dym_electro;
USE bd_dym_electro;

-- ========================================================
-- 1. MÓDULO DE SEGURIDAD Y ACCESO INTERNO (BACKOFFICE)
-- ========================================================

CREATE TABLE roles (
    id_rol INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL UNIQUE, 
    descripcion VARCHAR(255),
    estado TINYINT(1) DEFAULT 1 
) ENGINE=InnoDB;

CREATE TABLE usuarios (
    id_usuario INT AUTO_INCREMENT PRIMARY KEY,
    id_rol INT NOT NULL,
    nombres VARCHAR(100) NOT NULL,
    apellidos VARCHAR(100) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL, 
    estado TINYINT(1) DEFAULT 1,
    intentos_fallidos INT NOT NULL DEFAULT 0,
    bloqueado_hasta DATETIME NULL,
    fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_rol) REFERENCES roles(id_rol)
) ENGINE=InnoDB;

-- ========================================================
-- 2. MÓDULO DE ALMACÉN E INVENTARIO
-- ========================================================

CREATE TABLE categorias (
    id_categoria INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL UNIQUE,
    descripcion TEXT,
    estado TINYINT(1) DEFAULT 1
) ENGINE=InnoDB;

CREATE TABLE marcas (
    id_marca INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL UNIQUE,
    descripcion VARCHAR(255),
    estado TINYINT(1) DEFAULT 1
) ENGINE=InnoDB;

CREATE TABLE productos (
    id_producto INT AUTO_INCREMENT PRIMARY KEY,
    codigo VARCHAR(50) UNIQUE NOT NULL,
    nombre VARCHAR(150) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
    descripcion TEXT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci,
    precio_venta DECIMAL(10,2) NOT NULL,
    stock INT NOT NULL DEFAULT 0,
    stock_minimo INT NOT NULL DEFAULT 5, 
    id_categoria INT NOT NULL,
    id_marca INT NOT NULL,
    estado TINYINT(1) DEFAULT 1,
    FOREIGN KEY (id_categoria) REFERENCES categorias(id_categoria),
    FOREIGN KEY (id_marca) REFERENCES marcas(id_marca)
) ENGINE=InnoDB;

CREATE TABLE producto_imagenes (
    id_imagen INT AUTO_INCREMENT PRIMARY KEY,
    id_producto INT NOT NULL,
    url_imagen VARCHAR(500) NOT NULL,
    es_principal TINYINT(1) DEFAULT 0, 
    orden INT DEFAULT 0,
    FOREIGN KEY (id_producto) REFERENCES productos(id_producto) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ========================================================
-- 3. MÓDULO DE COMPRAS (ABASTECIMIENTO)
-- ========================================================

CREATE TABLE proveedores (
    id_proveedor INT AUTO_INCREMENT PRIMARY KEY,
    ruc VARCHAR(11) UNIQUE NOT NULL,
    razon_social VARCHAR(150) NOT NULL,
    telefono VARCHAR(20),
    direccion VARCHAR(255),
    email VARCHAR(100),
    fecha_registro DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE compras (
    id_compra INT AUTO_INCREMENT PRIMARY KEY,
    id_proveedor INT NOT NULL,
    fecha_compra DATETIME DEFAULT CURRENT_TIMESTAMP,
    total DECIMAL(10,2) NOT NULL,
    numero_comprobante VARCHAR(50),
    FOREIGN KEY (id_proveedor) REFERENCES proveedores(id_proveedor)
) ENGINE=InnoDB;

CREATE TABLE detalle_compras (
    id_detalle_compra INT AUTO_INCREMENT PRIMARY KEY,
    id_compra INT NOT NULL,
    id_producto INT NOT NULL,
    cantidad INT NOT NULL,
    precio_compra DECIMAL(10,2) NOT NULL,
    FOREIGN KEY (id_compra) REFERENCES compras(id_compra),
    FOREIGN KEY (id_producto) REFERENCES productos(id_producto)
) ENGINE=InnoDB;

-- ========================================================
-- 4. MÓDULO DE VENTAS (CLIENTES, CARRITO Y TIENDA WEB)
-- ========================================================

CREATE TABLE clientes (
    id_cliente INT AUTO_INCREMENT PRIMARY KEY,
    tipo_documento ENUM('DNI', 'RUC', 'CE') NOT NULL,
    numero_documento VARCHAR(15) UNIQUE NOT NULL,
    nombres VARCHAR(100) NOT NULL,
    apellidos VARCHAR(100) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL, 
    telefono VARCHAR(20),
    direccion VARCHAR(255),
    estado TINYINT(1) DEFAULT 1, 
    intentos_fallidos INT NOT NULL DEFAULT 0,
    bloqueado_hasta DATETIME NULL,
    fecha_registro DATETIME DEFAULT current_timestamp
) ENGINE=InnoDB;

CREATE TABLE carrito (
    id_carrito INT AUTO_INCREMENT PRIMARY KEY,
    id_cliente INT UNIQUE NOT NULL, 
    estado ENUM('Activo','Comprado','Abandonado') DEFAULT 'Activo',
    FOREIGN KEY (id_cliente) REFERENCES clientes(id_cliente) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE detalle_carrito (
    id_detalle_carrito INT AUTO_INCREMENT PRIMARY KEY,
    id_carrito INT NOT NULL,
    id_producto INT NOT NULL,
    cantidad INT NOT NULL DEFAULT 1,
    UNIQUE (id_carrito, id_producto),
    FOREIGN KEY (id_carrito) REFERENCES carrito(id_carrito) ON DELETE CASCADE,
    FOREIGN KEY (id_producto) REFERENCES productos(id_producto) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE correlativos_comprobante (
    id_correlativo INT AUTO_INCREMENT PRIMARY KEY,
    tipo_comprobante ENUM('Boleta','Factura') NOT NULL UNIQUE,
    serie VARCHAR(4) NOT NULL,
    ultimo_numero INT NOT NULL DEFAULT 0
) ENGINE=InnoDB;

INSERT INTO correlativos_comprobante (tipo_comprobante, serie, ultimo_numero) VALUES
('Boleta','B001',0),
('Factura','F001',0);

CREATE TABLE ventas (
    id_venta INT AUTO_INCREMENT PRIMARY KEY,
    id_cliente INT NOT NULL,
    fecha_venta DATETIME DEFAULT CURRENT_TIMESTAMP,
    total DECIMAL(10,2) NOT NULL,
    estado_venta ENUM('Pendiente', 'Pagado', 'Rechazado', 'Anulado') DEFAULT 'Pendiente',
    tipo_comprobante ENUM('Boleta', 'Factura') NOT NULL,
    serie_comprobante VARCHAR(4) NULL,
    numero_comprobante INT NULL,
    UNIQUE KEY uq_comprobante (tipo_comprobante, serie_comprobante, numero_comprobante),
    FOREIGN KEY (id_cliente) REFERENCES clientes(id_cliente)
) ENGINE=InnoDB;

CREATE TABLE detalle_ventas (
    id_detalle_venta INT AUTO_INCREMENT PRIMARY KEY,
    id_venta INT NOT NULL,
    id_producto INT NOT NULL,
    cantidad INT NOT NULL,
    precio_venta DECIMAL(10,2) NOT NULL,
    subtotal DECIMAL(10,2) NOT NULL,
    UNIQUE (id_venta, id_producto),
    FOREIGN KEY (id_venta) REFERENCES ventas(id_venta),
    FOREIGN KEY (id_producto) REFERENCES productos(id_producto)
) ENGINE=InnoDB;

-- ========================================================
-- 5. MÓDULO DE PASARELA DE PAGOS (CULQI API)
-- ========================================================

CREATE TABLE pagos_culqi (
    id_pago INT AUTO_INCREMENT PRIMARY KEY,
    id_venta INT NOT NULL,
    culqi_charge_id VARCHAR(100) UNIQUE NOT NULL, 
    monto DECIMAL(10,2) NOT NULL,                 
    moneda VARCHAR(10) DEFAULT 'PEN',             
    estado_pago VARCHAR(50) NOT NULL,             
    tarjeta_marca VARCHAR(50),                    
    tarjeta_tipo VARCHAR(30),                     
    mensaje_respuesta VARCHAR(255),               
    fecha_pago DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_venta) REFERENCES ventas(id_venta)
) ENGINE=InnoDB;

-- ÍNDICES
CREATE INDEX idx_producto_nombre ON productos(nombre);
CREATE INDEX idx_producto_codigo ON productos(codigo);
CREATE INDEX idx_cliente_email ON clientes(email);
CREATE INDEX idx_usuario_email ON usuarios(email);
CREATE INDEX idx_producto_imagenes_producto ON producto_imagenes(id_producto);

-- ============================================================================
-- TRIGGERS
-- ============================================================================

DELIMITER $$

CREATE TRIGGER trg_clientes_after_insert
AFTER INSERT ON clientes
FOR EACH ROW
BEGIN
    INSERT INTO carrito (id_cliente, estado) VALUES (NEW.id_cliente, 'Activo');
END$$

CREATE TRIGGER trg_detalle_carrito_before_insert
BEFORE INSERT ON detalle_carrito
FOR EACH ROW
BEGIN
    DECLARE v_stock INT;
    SELECT stock INTO v_stock FROM productos WHERE id_producto = NEW.id_producto;
    IF v_stock IS NULL THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'El producto no existe';
    ELSEIF NEW.cantidad > v_stock THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Stock insuficiente para agregar al carrito';
    END IF;
END$$

CREATE TRIGGER trg_detalle_carrito_before_update
BEFORE UPDATE ON detalle_carrito
FOR EACH ROW
BEGIN
    DECLARE v_stock INT;
    SELECT stock INTO v_stock FROM productos WHERE id_producto = NEW.id_producto;
    IF NEW.cantidad > v_stock THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Stock insuficiente para la cantidad solicitada';
    END IF;
END$$

CREATE TRIGGER trg_detalle_ventas_before_insert
BEFORE INSERT ON detalle_ventas
FOR EACH ROW
BEGIN
    DECLARE v_stock INT;
    SELECT stock INTO v_stock FROM productos WHERE id_producto = NEW.id_producto;
    IF v_stock IS NULL THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'El producto no existe';
    ELSEIF NEW.cantidad > v_stock THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Stock insuficiente para completar la venta';
    END IF;
END$$

CREATE TRIGGER trg_detalle_ventas_after_insert
AFTER INSERT ON detalle_ventas
FOR EACH ROW
BEGIN
    UPDATE productos SET stock = stock - NEW.cantidad WHERE id_producto = NEW.id_producto;
END$$

CREATE TRIGGER trg_ventas_after_update_anulacion
AFTER UPDATE ON ventas
FOR EACH ROW
BEGIN
    IF NEW.estado_venta = 'Anulado' AND OLD.estado_venta <> 'Anulado' THEN
        UPDATE productos p
        INNER JOIN detalle_ventas dv ON dv.id_producto = p.id_producto
        SET p.stock = p.stock + dv.cantidad
        WHERE dv.id_venta = NEW.id_venta;
    END IF;
END$$

CREATE TRIGGER trg_detalle_compras_after_insert
AFTER INSERT ON detalle_compras
FOR EACH ROW
BEGIN
    UPDATE productos SET stock = stock + NEW.cantidad WHERE id_producto = NEW.id_producto;
END$$

CREATE TRIGGER trg_producto_imagenes_after_insert
AFTER INSERT ON producto_imagenes
FOR EACH ROW
BEGIN
    IF NEW.es_principal = 1 THEN
        UPDATE producto_imagenes
        SET es_principal = 0
        WHERE id_producto = NEW.id_producto AND id_imagen <> NEW.id_imagen;
    END IF;
END$$

CREATE TRIGGER trg_producto_imagenes_after_update
AFTER UPDATE ON producto_imagenes
FOR EACH ROW
BEGIN
    IF NEW.es_principal = 1 AND OLD.es_principal = 0 THEN
        UPDATE producto_imagenes
        SET es_principal = 0
        WHERE id_producto = NEW.id_producto AND id_imagen <> NEW.id_imagen;
    END IF;
END$$

DELIMITER ;

-- ============================================================================
-- PROCEDIMIENTOS ALMACENADOS
-- (Incluye todas las funcionalidades de Usuarios, Carrito, Catálogo, Ventas y Compras)
-- ============================================================================

DELIMITER $$

-- SP USUARIOS
CREATE PROCEDURE sp_crear_usuario(IN p_id_rol INT, IN p_nombres VARCHAR(100), IN p_apellidos VARCHAR(100), IN p_email VARCHAR(150), IN p_password_hash VARCHAR(255))
BEGIN INSERT INTO usuarios (id_rol, nombres, apellidos, email, password) VALUES (p_id_rol, p_nombres, p_apellidos, p_email, p_password_hash); SELECT LAST_INSERT_ID() AS id_usuario; END$$
CREATE PROCEDURE sp_editar_usuario(IN p_id_usuario INT, IN p_id_rol INT, IN p_nombres VARCHAR(100), IN p_apellidos VARCHAR(100), IN p_email VARCHAR(150))
BEGIN UPDATE usuarios SET id_rol = p_id_rol, nombres = p_nombres, apellidos = p_apellidos, email = p_email WHERE id_usuario = p_id_usuario; END$$
CREATE PROCEDURE sp_cambiar_estado_usuario(IN p_id_usuario INT, IN p_estado TINYINT)
BEGIN UPDATE usuarios SET estado = p_estado WHERE id_usuario = p_id_usuario; END$$
CREATE PROCEDURE sp_obtener_usuario_por_email(IN p_email VARCHAR(150))
BEGIN SELECT u.id_usuario, u.id_rol, r.nombre AS nombre_rol, u.nombres, u.apellidos, u.email, u.password, u.estado, u.intentos_fallidos, u.bloqueado_hasta FROM usuarios u INNER JOIN roles r ON r.id_rol = u.id_rol WHERE u.email = p_email; END$$
CREATE PROCEDURE sp_registrar_fallo_login_usuario(IN p_email VARCHAR(150))
BEGIN UPDATE usuarios SET intentos_fallidos = intentos_fallidos + 1, bloqueado_hasta = CASE WHEN intentos_fallidos + 1 >= 5 THEN DATE_ADD(NOW(), INTERVAL 15 MINUTE) ELSE bloqueado_hasta END WHERE email = p_email; END$$
CREATE PROCEDURE sp_login_exitoso_usuario(IN p_email VARCHAR(150))
BEGIN UPDATE usuarios SET intentos_fallidos = 0, bloqueado_hasta = NULL WHERE email = p_email; END$$

-- SP CLIENTES
CREATE PROCEDURE sp_registrar_cliente(IN p_tipo_documento ENUM('DNI','RUC','CE'), IN p_numero_documento VARCHAR(15), IN p_nombres VARCHAR(100), IN p_apellidos VARCHAR(100), IN p_email VARCHAR(150), IN p_password_hash VARCHAR(255), IN p_telefono VARCHAR(20), IN p_direccion VARCHAR(255))
BEGIN INSERT INTO clientes (tipo_documento, numero_documento, nombres, apellidos, email, password, telefono, direccion) VALUES (p_tipo_documento, p_numero_documento, p_nombres, p_apellidos, p_email, p_password_hash, p_telefono, p_direccion); SELECT LAST_INSERT_ID() AS id_cliente; END$$
CREATE PROCEDURE sp_editar_cliente(IN p_id_cliente INT, IN p_nombres VARCHAR(100), IN p_apellidos VARCHAR(100), IN p_telefono VARCHAR(20), IN p_direccion VARCHAR(255))
BEGIN UPDATE clientes SET nombres = p_nombres, apellidos = p_apellidos, telefono = p_telefono, direccion = p_direccion WHERE id_cliente = p_id_cliente; END$$
CREATE PROCEDURE sp_obtener_cliente_por_email(IN p_email VARCHAR(150))
BEGIN SELECT id_cliente, tipo_documento, numero_documento, nombres, apellidos, email, password, telefono, direccion, estado, intentos_fallidos, bloqueado_hasta FROM clientes WHERE email = p_email; END$$
CREATE PROCEDURE sp_registrar_fallo_login_cliente(IN p_email VARCHAR(150))
BEGIN UPDATE clientes SET intentos_fallidos = intentos_fallidos + 1, bloqueado_hasta = CASE WHEN intentos_fallidos + 1 >= 5 THEN DATE_ADD(NOW(), INTERVAL 15 MINUTE) ELSE bloqueado_hasta END WHERE email = p_email; END$$
CREATE PROCEDURE sp_login_exitoso_cliente(IN p_email VARCHAR(150))
BEGIN UPDATE clientes SET intentos_fallidos = 0, bloqueado_hasta = NULL WHERE email = p_email; END$$

-- SP CARRITO
CREATE PROCEDURE sp_agregar_al_carrito(IN p_id_cliente INT, IN p_id_producto INT, IN p_cantidad INT)
BEGIN DECLARE v_id_carrito INT; SELECT id_carrito INTO v_id_carrito FROM carrito WHERE id_cliente = p_id_cliente; INSERT INTO detalle_carrito (id_carrito, id_producto, cantidad) VALUES (v_id_carrito, p_id_producto, p_cantidad) ON DUPLICATE KEY UPDATE cantidad = cantidad + p_cantidad; END$$
CREATE PROCEDURE sp_actualizar_cantidad_carrito(IN p_id_cliente INT, IN p_id_producto INT, IN p_cantidad INT)
BEGIN DECLARE v_id_carrito INT; SELECT id_carrito INTO v_id_carrito FROM carrito WHERE id_cliente = p_id_cliente; UPDATE detalle_carrito SET cantidad = p_cantidad WHERE id_carrito = v_id_carrito AND id_producto = p_id_producto; END$$
CREATE PROCEDURE sp_eliminar_producto_carrito(IN p_id_cliente INT, IN p_id_producto INT)
BEGIN DECLARE v_id_carrito INT; SELECT id_carrito INTO v_id_carrito FROM carrito WHERE id_cliente = p_id_cliente; DELETE FROM detalle_carrito WHERE id_carrito = v_id_carrito AND id_producto = p_id_producto; END$$
CREATE PROCEDURE sp_vaciar_carrito(IN p_id_cliente INT)
BEGIN DECLARE v_id_carrito INT; SELECT id_carrito INTO v_id_carrito FROM carrito WHERE id_cliente = p_id_cliente; DELETE FROM detalle_carrito WHERE id_carrito = v_id_carrito; END$$
CREATE PROCEDURE sp_obtener_carrito(IN p_id_cliente INT)
BEGIN SELECT dc.id_producto, p.nombre, p.precio_venta, dc.cantidad, (dc.cantidad * p.precio_venta) AS subtotal, p.stock, img.url_imagen AS imagen_principal FROM carrito c INNER JOIN detalle_carrito dc ON dc.id_carrito = c.id_carrito INNER JOIN productos p ON p.id_producto = dc.id_producto LEFT JOIN producto_imagenes img ON img.id_producto = p.id_producto AND img.es_principal = 1 WHERE c.id_cliente = p_id_cliente; END$$

-- SP CATÁLOGO
CREATE PROCEDURE sp_listar_catalogo()
BEGIN SELECT p.id_producto, p.codigo, p.nombre, p.descripcion, p.precio_venta, p.stock, c.nombre AS categoria, m.nombre AS marca, img.url_imagen AS imagen_principal FROM productos p INNER JOIN categorias c ON c.id_categoria = p.id_categoria INNER JOIN marcas m ON m.id_marca = p.id_marca LEFT JOIN producto_imagenes img ON img.id_producto = p.id_producto AND img.es_principal = 1 WHERE p.estado = 1; END$$
CREATE PROCEDURE sp_obtener_producto_detalle(IN p_id_producto INT)
BEGIN SELECT p.id_producto, p.codigo, p.nombre, p.descripcion, p.precio_venta, p.stock, c.nombre AS categoria, m.nombre AS marca FROM productos p INNER JOIN categorias c ON c.id_categoria = p.id_categoria INNER JOIN marcas m ON m.id_marca = p.id_marca WHERE p.id_producto = p_id_producto AND p.estado = 1; SELECT id_imagen, url_imagen, es_principal, orden FROM producto_imagenes WHERE id_producto = p_id_producto ORDER BY es_principal DESC, orden ASC; END$$
CREATE PROCEDURE sp_buscar_productos(IN p_texto VARCHAR(150))
BEGIN SELECT p.id_producto, p.codigo, p.nombre, p.precio_venta, p.stock, c.nombre AS categoria, m.nombre AS marca, img.url_imagen AS imagen_principal FROM productos p INNER JOIN categorias c ON c.id_categoria = p.id_categoria INNER JOIN marcas m ON m.id_marca = p.id_marca LEFT JOIN producto_imagenes img ON img.id_producto = p.id_producto AND img.es_principal = 1 WHERE p.estado = 1 AND (p.nombre LIKE CONCAT('%', p_texto, '%') OR p.descripcion LIKE CONCAT('%', p_texto, '%') OR p.codigo LIKE CONCAT('%', p_texto, '%')); END$$
CREATE PROCEDURE sp_filtrar_productos(IN p_id_categoria INT, IN p_id_marca INT, IN p_precio_min DECIMAL(10,2), IN p_precio_max DECIMAL(10,2))
BEGIN SELECT p.id_producto, p.codigo, p.nombre, p.precio_venta, p.stock, c.nombre AS categoria, m.nombre AS marca, img.url_imagen AS imagen_principal FROM productos p INNER JOIN categorias c ON c.id_categoria = p.id_categoria INNER JOIN marcas m ON m.id_marca = p.id_marca LEFT JOIN producto_imagenes img ON img.id_producto = p.id_producto AND img.es_principal = 1 WHERE p.estado = 1 AND (p_id_categoria IS NULL OR p.id_categoria = p_id_categoria) AND (p_id_marca IS NULL OR p.id_marca = p_id_marca) AND (p_precio_min IS NULL OR p.precio_venta >= p_precio_min) AND (p_precio_max IS NULL OR p.precio_venta <= p_precio_max); END$$
CREATE PROCEDURE sp_agregar_imagen_producto(IN p_id_producto INT, IN p_url_imagen VARCHAR(500), IN p_es_principal TINYINT, IN p_orden INT)
BEGIN IF p_es_principal = 1 THEN UPDATE producto_imagenes SET es_principal = 0 WHERE id_producto = p_id_producto; END IF; INSERT INTO producto_imagenes (id_producto, url_imagen, es_principal, orden) VALUES (p_id_producto, p_url_imagen, p_es_principal, p_orden); END$$

-- SP VENTAS
CREATE PROCEDURE sp_generar_venta(IN p_id_cliente INT, IN p_tipo_comprobante ENUM('Boleta','Factura'))
BEGIN
    DECLARE v_id_carrito INT; DECLARE v_total DECIMAL(10,2); DECLARE v_id_venta INT; DECLARE v_serie VARCHAR(4); DECLARE v_numero INT; DECLARE v_items INT;
    DECLARE EXIT HANDLER FOR SQLEXCEPTION BEGIN ROLLBACK; RESIGNAL; END;
    START TRANSACTION;
    SELECT id_carrito INTO v_id_carrito FROM carrito WHERE id_cliente = p_id_cliente;
    SELECT COUNT(*) INTO v_items FROM detalle_carrito WHERE id_carrito = v_id_carrito;
    IF v_items = 0 THEN SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'El carrito está vacío, no se puede generar la venta'; END IF;
    SELECT SUM(dc.cantidad * p.precio_venta) INTO v_total FROM detalle_carrito dc INNER JOIN productos p ON p.id_producto = dc.id_producto WHERE dc.id_carrito = v_id_carrito;
    SELECT serie, ultimo_numero + 1 INTO v_serie, v_numero FROM correlativos_comprobante WHERE tipo_comprobante = p_tipo_comprobante FOR UPDATE;
    UPDATE correlativos_comprobante SET ultimo_numero = v_numero WHERE tipo_comprobante = p_tipo_comprobante;
    INSERT INTO ventas (id_cliente, total, estado_venta, tipo_comprobante, serie_comprobante, numero_comprobante) VALUES (p_id_cliente, v_total, 'Pendiente', p_tipo_comprobante, v_serie, v_numero);
    SET v_id_venta = LAST_INSERT_ID();
    INSERT INTO detalle_ventas (id_venta, id_producto, cantidad, precio_venta, subtotal) SELECT v_id_venta, dc.id_producto, dc.cantidad, p.precio_venta, dc.cantidad * p.precio_venta FROM detalle_carrito dc INNER JOIN productos p ON p.id_producto = dc.id_producto WHERE dc.id_carrito = v_id_carrito;
    DELETE FROM detalle_carrito WHERE id_carrito = v_id_carrito;
    COMMIT;
    SELECT v_id_venta AS id_venta, v_serie AS serie, v_numero AS numero, v_total AS total;
END$$

CREATE PROCEDURE sp_anular_venta(IN p_id_venta INT)
BEGIN UPDATE ventas SET estado_venta = 'Anulado' WHERE id_venta = p_id_venta; END$$

CREATE PROCEDURE sp_obtener_comprobante(IN p_id_venta INT)
BEGIN SELECT v.id_venta, v.tipo_comprobante, v.serie_comprobante, v.numero_comprobante, v.fecha_venta, v.total, v.estado_venta, cl.nombres, cl.apellidos, cl.tipo_documento, cl.numero_documento FROM ventas v INNER JOIN clientes cl ON cl.id_cliente = v.id_cliente WHERE v.id_venta = p_id_venta; SELECT dv.id_producto, p.nombre, dv.cantidad, dv.precio_venta, dv.subtotal FROM detalle_ventas dv INNER JOIN productos p ON p.id_producto = dv.id_producto WHERE dv.id_venta = p_id_venta; END$$

CREATE PROCEDURE sp_historial_ventas_cliente(IN p_id_cliente INT)
BEGIN SELECT id_venta, tipo_comprobante, serie_comprobante, numero_comprobante, fecha_venta, total, estado_venta FROM ventas WHERE id_cliente = p_id_cliente ORDER BY fecha_venta DESC; END$$

-- SP COMPRAS
CREATE PROCEDURE sp_registrar_compra(IN p_id_proveedor INT, IN p_numero_comprobante VARCHAR(50))
BEGIN INSERT INTO compras (id_proveedor, total, numero_comprobante) VALUES (p_id_proveedor, 0, p_numero_comprobante); SELECT LAST_INSERT_ID() AS id_compra; END$$
CREATE PROCEDURE sp_agregar_detalle_compra(IN p_id_compra INT, IN p_id_producto INT, IN p_cantidad INT, IN p_precio_compra DECIMAL(10,2))
BEGIN INSERT INTO detalle_compras (id_compra, id_producto, cantidad, precio_compra) VALUES (p_id_compra, p_id_producto, p_cantidad, p_precio_compra); UPDATE compras SET total = total + (p_cantidad * p_precio_compra) WHERE id_compra = p_id_compra; END$$
CREATE PROCEDURE sp_obtener_detalle_compra(IN p_id_compra INT)
BEGIN SELECT c.id_compra, c.fecha_compra, c.total, c.numero_comprobante, pr.razon_social AS proveedor FROM compras c INNER JOIN proveedores pr ON pr.id_proveedor = c.id_proveedor WHERE c.id_compra = p_id_compra; SELECT dc.id_producto, p.nombre, dc.cantidad, dc.precio_compra FROM detalle_compras dc INNER JOIN productos p ON p.id_producto = dc.id_producto WHERE dc.id_compra = p_id_compra; END$$

-- SP PAGOS
CREATE PROCEDURE sp_registrar_pago_culqi(IN p_id_venta INT, IN p_culqi_charge_id VARCHAR(100), IN p_monto DECIMAL(10,2), IN p_moneda VARCHAR(10), IN p_estado_pago VARCHAR(50), IN p_tarjeta_marca VARCHAR(50), IN p_tarjeta_tipo VARCHAR(30), IN p_mensaje_respuesta VARCHAR(255))
BEGIN INSERT INTO pagos_culqi (id_venta, culqi_charge_id, monto, moneda, estado_pago, tarjeta_marca, tarjeta_tipo, mensaje_respuesta) VALUES (p_id_venta, p_culqi_charge_id, p_monto, p_moneda, p_estado_pago, p_tarjeta_marca, p_tarjeta_tipo, p_mensaje_respuesta); IF p_estado_pago = 'successful' THEN UPDATE ventas SET estado_venta = 'Pagado' WHERE id_venta = p_id_venta; ELSE UPDATE ventas SET estado_venta = 'Rechazado' WHERE id_venta = p_id_venta; END IF; END$$

-- SP PRODUCTOS (alta, edicion, stock manual, estado)
CREATE PROCEDURE sp_crear_producto(IN p_codigo VARCHAR(50), IN p_nombre VARCHAR(150), IN p_descripcion TEXT, IN p_precio_venta DECIMAL(10,2), IN p_stock INT, IN p_stock_minimo INT, IN p_id_categoria INT, IN p_id_marca INT)
BEGIN INSERT INTO productos (codigo, nombre, descripcion, precio_venta, stock, stock_minimo, id_categoria, id_marca) VALUES (p_codigo, p_nombre, p_descripcion, p_precio_venta, p_stock, p_stock_minimo, p_id_categoria, p_id_marca); SELECT LAST_INSERT_ID() AS id_producto; END$$
CREATE PROCEDURE sp_editar_producto(IN p_id_producto INT, IN p_codigo VARCHAR(50), IN p_nombre VARCHAR(150), IN p_descripcion TEXT, IN p_precio_venta DECIMAL(10,2), IN p_stock_minimo INT, IN p_id_categoria INT, IN p_id_marca INT)
BEGIN UPDATE productos SET codigo = p_codigo, nombre = p_nombre, descripcion = p_descripcion, precio_venta = p_precio_venta, stock_minimo = p_stock_minimo, id_categoria = p_id_categoria, id_marca = p_id_marca WHERE id_producto = p_id_producto; END$$
CREATE PROCEDURE sp_obtener_producto_para_editar(IN p_id_producto INT)
BEGIN SELECT id_producto, codigo, nombre, descripcion, precio_venta, stock, stock_minimo, id_categoria, id_marca, estado FROM productos WHERE id_producto = p_id_producto; END$$
CREATE PROCEDURE sp_ajustar_stock_producto(IN p_id_producto INT, IN p_stock INT)
BEGIN UPDATE productos SET stock = p_stock WHERE id_producto = p_id_producto; END$$
CREATE PROCEDURE sp_cambiar_estado_producto(IN p_id_producto INT, IN p_estado TINYINT)
BEGIN UPDATE productos SET estado = p_estado WHERE id_producto = p_id_producto; END$$

-- SP CATEGORIAS
CREATE PROCEDURE sp_listar_categorias()
BEGIN SELECT id_categoria, nombre, descripcion, estado FROM categorias ORDER BY nombre; END$$
CREATE PROCEDURE sp_crear_categoria(IN p_nombre VARCHAR(100), IN p_descripcion TEXT)
BEGIN INSERT INTO categorias (nombre, descripcion) VALUES (p_nombre, p_descripcion); SELECT LAST_INSERT_ID() AS id_categoria; END$$
CREATE PROCEDURE sp_editar_categoria(IN p_id_categoria INT, IN p_nombre VARCHAR(100), IN p_descripcion TEXT)
BEGIN UPDATE categorias SET nombre = p_nombre, descripcion = p_descripcion WHERE id_categoria = p_id_categoria; END$$
CREATE PROCEDURE sp_cambiar_estado_categoria(IN p_id_categoria INT, IN p_estado TINYINT)
BEGIN UPDATE categorias SET estado = p_estado WHERE id_categoria = p_id_categoria; END$$

-- SP MARCAS
CREATE PROCEDURE sp_listar_marcas()
BEGIN SELECT id_marca, nombre, descripcion, estado FROM marcas ORDER BY nombre; END$$
CREATE PROCEDURE sp_crear_marca(IN p_nombre VARCHAR(100), IN p_descripcion VARCHAR(255))
BEGIN INSERT INTO marcas (nombre, descripcion) VALUES (p_nombre, p_descripcion); SELECT LAST_INSERT_ID() AS id_marca; END$$
CREATE PROCEDURE sp_editar_marca(IN p_id_marca INT, IN p_nombre VARCHAR(100), IN p_descripcion VARCHAR(255))
BEGIN UPDATE marcas SET nombre = p_nombre, descripcion = p_descripcion WHERE id_marca = p_id_marca; END$$
CREATE PROCEDURE sp_cambiar_estado_marca(IN p_id_marca INT, IN p_estado TINYINT)
BEGIN UPDATE marcas SET estado = p_estado WHERE id_marca = p_id_marca; END$$

-- SP PROVEEDORES
CREATE PROCEDURE sp_listar_proveedores()
BEGIN SELECT id_proveedor, ruc, razon_social, telefono, direccion, email, fecha_registro FROM proveedores ORDER BY razon_social; END$$
CREATE PROCEDURE sp_crear_proveedor(IN p_ruc VARCHAR(11), IN p_razon_social VARCHAR(150), IN p_telefono VARCHAR(20), IN p_direccion VARCHAR(255), IN p_email VARCHAR(100))
BEGIN INSERT INTO proveedores (ruc, razon_social, telefono, direccion, email) VALUES (p_ruc, p_razon_social, p_telefono, p_direccion, p_email); SELECT LAST_INSERT_ID() AS id_proveedor; END$$
CREATE PROCEDURE sp_editar_proveedor(IN p_id_proveedor INT, IN p_razon_social VARCHAR(150), IN p_telefono VARCHAR(20), IN p_direccion VARCHAR(255), IN p_email VARCHAR(100))
BEGIN UPDATE proveedores SET razon_social = p_razon_social, telefono = p_telefono, direccion = p_direccion, email = p_email WHERE id_proveedor = p_id_proveedor; END$$

-- SP ROLES (listado, para no hardcodear los ID de rol en el frontend)
CREATE PROCEDURE sp_listar_roles()
BEGIN SELECT id_rol, nombre, descripcion, estado FROM roles ORDER BY id_rol; END$$

-- SP LISTADOS ADMINISTRATIVOS (usuarios internos y clientes)
CREATE PROCEDURE sp_listar_usuarios()
BEGIN SELECT u.id_usuario, u.id_rol, r.nombre AS nombre_rol, u.nombres, u.apellidos, u.email, u.estado, u.fecha_creacion FROM usuarios u INNER JOIN roles r ON r.id_rol = u.id_rol ORDER BY u.id_usuario; END$$
CREATE PROCEDURE sp_listar_clientes()
BEGIN SELECT id_cliente, tipo_documento, numero_documento, nombres, apellidos, email, telefono, direccion, estado, fecha_registro FROM clientes ORDER BY id_cliente; END$$

DELIMITER ;

-- ============================================================================
-- 6. INSERCIÓN DE DATOS INICIALES (SEMILLAS) ADAPTADOS A D&M ELECTRO SOLUCIONES
-- ============================================================================

INSERT INTO roles (nombre, descripcion) VALUES
('Administrador', 'Acceso total al sistema de proyectos y gestión de recursos'),
('Vendedor', 'Gestión de ventas y cotizaciones para clientes'),
('Almacenero', 'Control de stock de materiales, equipos industriales y repuestos');

-- Usuario administrador modificado con el correo del contacto del brochure
INSERT INTO usuarios (id_rol, nombres, apellidos, email, password, estado)
VALUES (1, 'Santos', 'De La Cruz Reyes', 'santos.delacruz@dym-electrosolutions.com.pe',
        '$2b$10$Ui82bdfQo0NMgjnpeCYOa.kp2dwPI/iTVi40AhPeZx0ZdDzo2/oYG', 1);

-- ============================================================================
-- CATEGORÍAS (Basadas en los servicios del brochure)
-- ============================================================================
INSERT INTO categorias (nombre, descripcion, estado) VALUES
('Climatización y Aire Acondicionado', 'Equipos para instalaciones en hogares, oficinas e industrias', 1),
('Cámaras de Seguridad', 'Sistemas de videovigilancia y equipos CCTV', 1),
('Sistemas de Radio Enlace', 'Equipos para comunicación segura y estable de radio frecuencia', 1),
('Detección de Alarma Contra Incendio', 'Sistemas de detección, paneles y sensores de humo', 1),
('Electricidad Industrial', 'Tableros, llaves térmicas e instalaciones eléctricas', 1),
('Automatización Industrial', 'Controladores lógicos (PLC), paneles HMI y contactores', 1),
('Estructuras Metálicas', 'Materiales para montaje y fabricación de estructuras', 1);

-- ============================================================================
-- MARCAS (Marcas representativas del sector tecnológico e industrial)
-- ============================================================================
INSERT INTO marcas (nombre, descripcion, estado) VALUES
('Hikvision', 'Soluciones de videovigilancia y seguridad', 1),
('Dahua', 'Cámaras y seguridad electrónica', 1),
('York', 'Sistemas de aire acondicionado y refrigeración', 1),
('Carrier', 'Equipos de climatización industrial y comercial', 1),
('Ubiquiti', 'Dispositivos de telecomunicaciones y redes inalámbricas', 1),
('MikroTik', 'Hardware de redes y ruteadores', 1),
('Bosch', 'Sistemas de detección de incendios y seguridad', 1),
('Schneider Electric', 'Equipos y tableros para gestión de energía eléctrica', 1),
('Siemens', 'Tecnología para automatización y digitalización industrial', 1);

-- ============================================================================
-- PRODUCTOS (Catálogo adaptado a ingeniería y tecnología)
-- ============================================================================
INSERT INTO productos (codigo, nombre, descripcion, precio_venta, stock, stock_minimo, id_categoria, id_marca, estado) VALUES
('CLI-001', 'Aire Acondicionado Split York 12000 BTU', 'Equipo de climatización de pared, alta eficiencia energética', 1450.00, 15, 5,
    (SELECT id_categoria FROM categorias WHERE nombre = 'Climatización y Aire Acondicionado'),
    (SELECT id_marca FROM marcas WHERE nombre = 'York'), 1),
('CLI-002', 'Aire Acondicionado Piso Techo Carrier 36000 BTU', 'Equipo comercial para grandes espacios, gas R410A', 4200.00, 8, 2,
    (SELECT id_categoria FROM categorias WHERE nombre = 'Climatización y Aire Acondicionado'),
    (SELECT id_marca FROM marcas WHERE nombre = 'Carrier'), 1),

('SEG-001', 'Cámara Domo PTZ Hikvision 2MP', 'Cámara IP con giro de 360 grados y zoom óptico 25x', 850.00, 20, 5,
    (SELECT id_categoria FROM categorias WHERE nombre = 'Cámaras de Seguridad'),
    (SELECT id_marca FROM marcas WHERE nombre = 'Hikvision'), 1),
('SEG-002', 'DVR Dahua 16 Canales Pentahíbrido', 'Grabador de video digital soporte hasta 5MP', 450.00, 12, 4,
    (SELECT id_categoria FROM categorias WHERE nombre = 'Cámaras de Seguridad'),
    (SELECT id_marca FROM marcas WHERE nombre = 'Dahua'), 1),

('RAD-001', 'Antena LiteBeam M5 Ubiquiti', 'Equipo para radio enlace punto a punto de 5GHz', 320.00, 30, 10,
    (SELECT id_categoria FROM categorias WHERE nombre = 'Sistemas de Radio Enlace'),
    (SELECT id_marca FROM marcas WHERE nombre = 'Ubiquiti'), 1),
('RAD-002', 'Router Board MikroTik RB750Gr3', 'Router de 5 puertos Gigabit Ethernet para gestión de red', 280.00, 25, 8,
    (SELECT id_categoria FROM categorias WHERE nombre = 'Sistemas de Radio Enlace'),
    (SELECT id_marca FROM marcas WHERE nombre = 'MikroTik'), 1),

('INC-001', 'Panel de Alarma Contra Incendios Bosch', 'Central analógica direccionable de 1 lazo', 2100.00, 5, 2,
    (SELECT id_categoria FROM categorias WHERE nombre = 'Detección de Alarma Contra Incendio'),
    (SELECT id_marca FROM marcas WHERE nombre = 'Bosch'), 1),
('INC-002', 'Detector de Humo Fotoeléctrico Bosch', 'Sensor de humo para instalación en techo', 85.00, 100, 20,
    (SELECT id_categoria FROM categorias WHERE nombre = 'Detección de Alarma Contra Incendio'),
    (SELECT id_marca FROM marcas WHERE nombre = 'Bosch'), 1),

('ELE-001', 'Interruptor Termomagnético 3x63A Schneider', 'Llave térmica tripolar para tablero industrial', 120.00, 50, 15,
    (SELECT id_categoria FROM categorias WHERE nombre = 'Electricidad Industrial'),
    (SELECT id_marca FROM marcas WHERE nombre = 'Schneider Electric'), 1),
('ELE-002', 'Tablero Eléctrico Metálico Autosoportado', 'Gabinete de distribución eléctrica 1800x800x400 mm', 1150.00, 4, 1,
    (SELECT id_categoria FROM categorias WHERE nombre = 'Electricidad Industrial'),
    (SELECT id_marca FROM marcas WHERE nombre = 'Schneider Electric'), 1),

('AUT-001', 'PLC Siemens LOGO! 12/24RCE', 'Módulo lógico de control con conexión Ethernet', 680.00, 15, 3,
    (SELECT id_categoria FROM categorias WHERE nombre = 'Automatización Industrial'),
    (SELECT id_marca FROM marcas WHERE nombre = 'Siemens'), 1),
('AUT-002', 'Pantalla HMI Siemens KTP400 Basic', 'Panel táctil de 4 pulgadas para control de procesos', 1200.00, 6, 2,
    (SELECT id_categoria FROM categorias WHERE nombre = 'Automatización Industrial'),
    (SELECT id_marca FROM marcas WHERE nombre = 'Siemens'), 1);

-- ============================================================================
-- IMÁGENES DE PRODUCTO
-- ============================================================================

DROP TRIGGER IF EXISTS trg_producto_imagenes_after_insert;
DROP TRIGGER IF EXISTS trg_producto_imagenes_after_update;

-- Climatización
INSERT INTO producto_imagenes (id_producto, url_imagen, es_principal, orden)
VALUES ((SELECT id_producto FROM productos WHERE codigo = 'CLI-001'), 'http://localhost:8080/img_productos/cli-001-york-split.png', 1, 0);

INSERT INTO producto_imagenes (id_producto, url_imagen, es_principal, orden)
VALUES ((SELECT id_producto FROM productos WHERE codigo = 'CLI-002'), 'http://localhost:8080/img_productos/cli-002-carrier-pisotecho.webp', 1, 0);

-- Seguridad
INSERT INTO producto_imagenes (id_producto, url_imagen, es_principal, orden)
VALUES ((SELECT id_producto FROM productos WHERE codigo = 'SEG-001'), 'http://localhost:8080/img_productos/seg-001-hikvision-ptz.jpg', 1, 0);

INSERT INTO producto_imagenes (id_producto, url_imagen, es_principal, orden)
VALUES ((SELECT id_producto FROM productos WHERE codigo = 'SEG-002'), 'http://localhost:8080/img_productos/seg-002-dahua-dvr.jpg', 1, 0);

-- Radio Enlace
INSERT INTO producto_imagenes (id_producto, url_imagen, es_principal, orden)
VALUES ((SELECT id_producto FROM productos WHERE codigo = 'RAD-001'), 'http://localhost:8080/img_productos/rad-001-ubiquiti-litebeam.jpg', 1, 0);

INSERT INTO producto_imagenes (id_producto, url_imagen, es_principal, orden)
VALUES ((SELECT id_producto FROM productos WHERE codigo = 'RAD-002'), 'http://localhost:8080/img_productos/rad-002-mikrotik-router.jpg', 1, 0);

-- Alarma Contra Incendio
INSERT INTO producto_imagenes (id_producto, url_imagen, es_principal, orden)
VALUES ((SELECT id_producto FROM productos WHERE codigo = 'INC-001'), 'http://localhost:8080/img_productos/inc-001-bosch-panel.webp', 1, 0);

INSERT INTO producto_imagenes (id_producto, url_imagen, es_principal, orden)
VALUES ((SELECT id_producto FROM productos WHERE codigo = 'INC-002'), 'http://localhost:8080/img_productos/inc-002-bosch-sensor.jpg', 1, 0);

-- Electricidad Industrial
INSERT INTO producto_imagenes (id_producto, url_imagen, es_principal, orden)
VALUES ((SELECT id_producto FROM productos WHERE codigo = 'ELE-001'), 'http://localhost:8080/img_productos/ele-001-schneider-llave.webp', 1, 0);

INSERT INTO producto_imagenes (id_producto, url_imagen, es_principal, orden)
VALUES ((SELECT id_producto FROM productos WHERE codigo = 'ELE-002'), 'http://localhost:8080/img_productos/ele-002-schneider-tablero.jpg', 1, 0);

-- Automatización
INSERT INTO producto_imagenes (id_producto, url_imagen, es_principal, orden)
VALUES ((SELECT id_producto FROM productos WHERE codigo = 'AUT-001'), 'http://localhost:8080/img_productos/aut-001-siemens-logo.jpg', 1, 0);

INSERT INTO producto_imagenes (id_producto, url_imagen, es_principal, orden)
VALUES ((SELECT id_producto FROM productos WHERE codigo = 'AUT-002'), 'http://localhost:8080/img_productos/aut-002-siemens-hmi.webp', 1, 0);