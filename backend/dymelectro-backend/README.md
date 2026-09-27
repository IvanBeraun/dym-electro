# D&M Electro Soluciones y Proyectos S.A.C. — Backend

Backend Spring Boot (Java 17) para el sistema de gestión de compras, ventas y
almacén de **D&M Electro Soluciones y Proyectos S.A.C.**, construido tomando
como base la arquitectura del backend de Huamán Music (mismo patrón: DAO +
`JdbcTemplate`/`CallableStatement` invocando *stored procedures*, sin lógica
de negocio en Java — toda la lógica crítica ya vive en los SP y triggers de
`bd_dym_electro`).

## Stack
- Spring Boot 4.1.0 (Java 17)
- MySQL (mysql-connector-j) vía `JdbcTemplate`/`CallableStatement`
- Spring Security + JWT (jjwt 0.12.6)
- Bean Validation (`spring-boot-starter-validation`)
- Lombok

## Configuración antes de correr
1. Ejecuta `database/script_bd_dym_electro.sql` en tu MySQL local (crea la BD
   `bd_dym_electro`, sus tablas, triggers, SP y datos semilla).
2. Edita `src/main/resources/application.properties`:
   - `spring.datasource.password` → tu contraseña real de MySQL.
   - `app.jwt.secret` → una cadena secreta larga y aleatoria (mínimo 32 caracteres).
3. Abre el proyecto en IntelliJ como proyecto Maven y corre
   `DymelectroBackendApplication`.

## Estructura
```
controller/   -> Endpoints REST (@RestController)
service/      -> Orquestación de casos de uso (sin lógica de negocio; eso vive en los SP)
dao/          -> Invocación de los sp_* vía JdbcProcedureSupport (CallableStatement)
dto/          -> Records de entrada/salida por módulo (auth, usuario, cliente, producto, carrito, venta, compra, pago)
security/     -> JWT (JwtUtil, JwtAuthenticationFilter, AuthPrincipal)
config/       -> SecurityConfig (CORS, rutas públicas/privadas, filtro JWT)
exception/    -> Manejo centralizado de errores (incluye los SIGNAL SQLSTATE '45000' de los triggers)
```

## Módulos incluidos (mapeados 1:1 al script de BD)
- **Auth**: login interno (`/api/auth/login/usuario`), login cliente
  (`/api/auth/login/cliente`), registro de cliente (`/api/auth/registro/cliente`).
- **Usuarios internos** (`/api/usuarios`): alta, edición, cambio de estado.
  Restringido al rol `Administrador` (nombre exacto de la tabla `roles`).
- **Clientes** (`/api/clientes/me`): ver/editar perfil propio.
- **Catálogo** (`/api/catalogo`): listar, buscar, filtrar, detalle, imágenes.
  Lectura pública (GET), escritura restringida a `Administrador`/`Almacenero`.
- **Carrito** (`/api/carrito`): agregar, actualizar, eliminar, vaciar, obtener.
  El `id_cliente` siempre sale del JWT, nunca del body.
- **Ventas** (`/api/ventas`): generar venta desde el carrito, comprobante,
  historial del cliente, anulación (personal interno).
- **Compras** (`/api/compras`): registrar compra a proveedor, agregar detalle
  (el trigger `trg_detalle_compras_after_insert` incrementa el stock solo).
- **Pagos Culqi** (`/api/pagos/culqi`): registra el resultado del cargo y
  actualiza el estado de la venta (`Pagado`/`Rechazado`) vía `sp_registrar_pago_culqi`.

## Notas importantes
- **Roles**: la tabla `roles` de `bd_dym_electro` trae `Administrador`,
  `Vendedor`, `Almacenero` (con esos nombres exactos, no `Admin`). Los
  `@PreAuthorize` ya están ajustados a `hasRole('ADMINISTRADOR')` /
  `hasAnyRole('ADMINISTRADOR', 'ALMACENERO')` — si renombran roles en la BD,
  actualicen también estos controllers.
- **Errores de negocio**: los `SIGNAL SQLSTATE '45000'` (stock insuficiente,
  carrito vacío, producto inexistente) se traducen automáticamente a HTTP 500
  con el mensaje real extraído por `GlobalExceptionHandler`. Si quieren que
  devuelvan 400 en vez de 500, se puede afinar ese handler.
- **CORS**: `SecurityConfig` permite cualquier origen (`*`) por ahora — hay un
  TODO para restringirlo al dominio real del frontend en producción.
- Esto es un **port directo de la arquitectura**, no una copia del dominio: no
  quedan referencias a instrumentos musicales; todo el catálogo/roles/DTOs
  corresponden 100% al esquema de `bd_dym_electro` (climatización, cámaras de
  seguridad, radioenlace, alarmas contra incendio, electricidad industrial,
  automatización industrial, estructuras metálicas).
