# D&M Electro — Frontend

Frontend en React (Vite, sin Tailwind ni UI libs externas) para la solución de
gestión de compras, ventas y almacén de **D&M Electro Soluciones y Proyectos SAC**.

## Cómo correrlo

```bash
npm install
cp .env.example .env      # ajusta VITE_API_URL si tu backend no está en localhost:8080
npm run dev
```

El backend Spring Boot debe estar corriendo en `http://localhost:8080` (CORS ya
está abierto con `allowedOriginPatterns("*")` en `SecurityConfig`).

## Estructura

```
src/
  api/          Un módulo por recurso del backend (1:1 con cada Controller)
  context/      AuthContext: guarda el JWT y el tipo de cuenta/rol
  routes/       RutaProtegida: control de acceso por sesión y rol
  components/
    layout/     ClienteLayout (tienda) y AdminLayout (panel interno, sidebar por rol)
    ui/         Spinner, Alerta, EstadoVacio
  pages/
    auth/       Login (cliente / personal interno) y Registro
    cliente/    Catálogo, detalle, carrito, checkout, mis compras, perfil, comprobante
    admin/      Dashboard, Usuarios, Compras, Ventas, Productos (imágenes)
  styles/       variables.css (tokens de marca) + global.css (todo lo demás)
```

## Roles y menús

El menú cambia según `tipoCuenta` y `rol` que devuelve el login:

- **Cliente** → navbar superior: Catálogo, Carrito, Mis compras, Mi perfil.
- **Administrador** → panel con sidebar: Resumen, Usuarios, Compras, Ventas, Catálogo.
- **Vendedor** → panel con sidebar: Resumen, Ventas.
- **Almacenero** → panel con sidebar: Resumen, Compras, Catálogo.

## Identidad visual

- Negro carbón + amarillo señal (cinta de seguridad eléctrica) como firma visual,
  usados con moderación (franja diagonal, acentos, badges).
- Azul institucional como color primario de acción/marca.
- Tipografía: Space Grotesk (títulos/display) + Inter (texto) + JetBrains Mono
  (códigos de producto, IDs).

## ⚠️ Endpoints que el backend aún no tiene

El frontend ya está preparado para consumirlos apenas existan (revisa los
comentarios `NOTA:` en `src/api/`):

1. `GET /api/usuarios` — listar todo el personal interno (hoy solo hay
   crear/editar/cambiar estado/`me`).
2. `GET /api/clientes` — listar todos los clientes (hoy solo hay `me`).
3. `GET /api/compras` y `GET /api/ventas` — listado general (hoy solo hay
   consulta por ID individual).
4. `GET /api/categorias`, `GET /api/marcas`, `GET /api/proveedores` — para
   poblar selects reales en filtros, "registrar compra" y un futuro alta de
   producto (hoy el filtro de categoría/marca del catálogo se arma en el
   cliente a partir de los productos ya cargados).
5. `POST /api/productos` (y `PUT`/`PATCH`) — crear/editar productos. Hoy solo
   existe `POST /api/catalogo/imagenes` para añadir imágenes a un producto
   que ya existe en la base de datos.

Mientras tanto, las pantallas de administración correspondientes (Usuarios,
Compras, Ventas, Productos) funcionan por ID manual y quedan marcadas con un
aviso amarillo explicando la limitación.

Adicionalmente, `GET /api/ventas/{idVenta}` solo exige `isAuthenticated()`, sin
validar que el comprobante pertenezca al cliente que lo solicita — conviene
revisar esa regla de negocio en el backend antes de producción.
