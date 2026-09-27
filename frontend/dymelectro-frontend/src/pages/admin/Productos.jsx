import { useEffect, useState } from 'react';
import { listarCatalogo, agregarImagenProducto, eliminarImagenProducto, obtenerDetalleProducto } from '../../api/catalogo.api';
import { X } from 'lucide-react';
import { listarCategorias } from '../../api/categoria.api';
import { listarMarcas } from '../../api/marca.api';
import {
  crearProducto,
  editarProducto,
  obtenerProductoParaEditar,
  ajustarStockProducto,
  cambiarEstadoProducto,
} from '../../api/producto.api';
import { formatearMoneda } from '../../utils/formato';
import Alerta from '../../components/ui/Alerta';
import Spinner from '../../components/ui/Spinner';
import EstadoVacio from '../../components/ui/EstadoVacio';
import { urlImagen } from '../../utils/imagen';

const CREAR_VACIO = {
  codigo: '',
  nombre: '',
  descripcion: '',
  precioVenta: '',
  stock: '',
  stockMinimo: '',
  idCategoria: '',
  idMarca: '',
};

const EDITAR_VACIO = {
  idProducto: null,
  codigo: '',
  nombre: '',
  descripcion: '',
  precioVenta: '',
  stockMinimo: '',
  idCategoria: '',
  idMarca: '',
};

export default function Productos() {
  const [catalogo, setCatalogo] = useState([]);
  const [cargandoCatalogo, setCargandoCatalogo] = useState(true);
  const [categorias, setCategorias] = useState([]);
  const [marcas, setMarcas] = useState([]);

  const [error, setError] = useState('');
  const [exito, setExito] = useState('');

  const [formCrear, setFormCrear] = useState(CREAR_VACIO);
  const [creando, setCreando] = useState(false);

  const [formEditar, setFormEditar] = useState(EDITAR_VACIO);
  const [guardandoEdicion, setGuardandoEdicion] = useState(false);

  const [ajusteStock, setAjusteStock] = useState({ idProducto: '', stock: '' });

  const [idImagenBuscar, setIdImagenBuscar] = useState('');
  const [productoImagenes, setProductoImagenes] = useState(null);
  const [formImagen, setFormImagen] = useState({ urlImagen: '', esPrincipal: false, orden: 0 });

  async function cargarCatalogo() {
    setCargandoCatalogo(true);
    setError('');
    try {
      const data = await listarCatalogo();
      setCatalogo(data);
    } catch (err) {
      setError(err.mensaje);
    } finally {
      setCargandoCatalogo(false);
    }
  }

  useEffect(() => {
    cargarCatalogo();
    listarCategorias().then(setCategorias).catch(() => { });
    listarMarcas().then(setMarcas).catch(() => { });
  }, []);

  function actualizarCrear(campo, valor) {
    setFormCrear((prev) => ({ ...prev, [campo]: valor }));
  }

  async function manejarCrear(e) {
    e.preventDefault();
    setError('');
    setExito('');
    setCreando(true);
    try {
      const { idProducto } = await crearProducto({
        ...formCrear,
        precioVenta: Number(formCrear.precioVenta),
        stock: Number(formCrear.stock),
        stockMinimo: Number(formCrear.stockMinimo),
        idCategoria: Number(formCrear.idCategoria),
        idMarca: Number(formCrear.idMarca),
      });
      setExito(`Producto creado con ID ${idProducto}.`);
      setFormCrear(CREAR_VACIO);
      await cargarCatalogo();
    } catch (err) {
      setError(err.mensaje);
    } finally {
      setCreando(false);
    }
  }

  async function iniciarEdicion(idProducto) {
    setError('');
    setExito('');
    try {
      const p = await obtenerProductoParaEditar(idProducto);
      setFormEditar({
        idProducto: p.idProducto,
        codigo: p.codigo,
        nombre: p.nombre,
        descripcion: p.descripcion || '',
        precioVenta: p.precioVenta,
        stockMinimo: p.stockMinimo,
        idCategoria: p.idCategoria,
        idMarca: p.idMarca,
      });
    } catch (err) {
      setError(err.mensaje);
    }
  }

  function cancelarEdicion() {
    setFormEditar(EDITAR_VACIO);
  }

  async function manejarEditar(e) {
    e.preventDefault();
    setError('');
    setExito('');
    setGuardandoEdicion(true);
    try {
      await editarProducto(formEditar.idProducto, {
        codigo: formEditar.codigo,
        nombre: formEditar.nombre,
        descripcion: formEditar.descripcion,
        precioVenta: Number(formEditar.precioVenta),
        stockMinimo: Number(formEditar.stockMinimo),
        idCategoria: Number(formEditar.idCategoria),
        idMarca: Number(formEditar.idMarca),
      });
      setExito(`Producto ${formEditar.idProducto} actualizado.`);
      setFormEditar(EDITAR_VACIO);
      await cargarCatalogo();
    } catch (err) {
      setError(err.mensaje);
    } finally {
      setGuardandoEdicion(false);
    }
  }

  async function manejarAjustarStock(e) {
    e.preventDefault();
    setError('');
    setExito('');
    try {
      await ajustarStockProducto(Number(ajusteStock.idProducto), Number(ajusteStock.stock));
      setExito(`Stock del producto ${ajusteStock.idProducto} actualizado a ${ajusteStock.stock}.`);
      setAjusteStock({ idProducto: '', stock: '' });
      await cargarCatalogo();
    } catch (err) {
      setError(err.mensaje);
    }
  }

  async function manejarDesactivar(idProducto) {
    setError('');
    setExito('');
    try {
      await cambiarEstadoProducto(idProducto, false);
      setExito(`Producto ${idProducto} desactivado.`);
      await cargarCatalogo();
    } catch (err) {
      setError(err.mensaje);
    }
  }

  // ---- Imagenes ----
  async function buscarProductoImagenes(e) {
    e.preventDefault();
    setError('');
    setExito('');
    setProductoImagenes(null);
    try {
      const data = await obtenerDetalleProducto(idImagenBuscar);
      setProductoImagenes(data);
    } catch (err) {
      setError(err.mensaje);
    }
  }

  async function manejarAgregarImagen(e) {
    e.preventDefault();
    setError('');
    setExito('');
    try {
      await agregarImagenProducto({
        idProducto: Number(idImagenBuscar),
        urlImagen: formImagen.urlImagen,
        esPrincipal: formImagen.esPrincipal,
        orden: Number(formImagen.orden),
      });
      setExito('Imagen agregada correctamente.');
      setFormImagen({ urlImagen: '', esPrincipal: false, orden: 0 });
      const data = await obtenerDetalleProducto(idImagenBuscar);
      setProductoImagenes(data);
    } catch (err) {
      setError(err.mensaje);
    }
  }

  async function manejarEliminarImagen(idImagen) {
    if (!window.confirm('¿Eliminar esta imagen del producto?')) return;
    setError('');
    setExito('');
    try {
      await eliminarImagenProducto(idImagen);
      setExito('Imagen eliminada.');
      const data = await obtenerDetalleProducto(idImagenBuscar);
      setProductoImagenes(data);
    } catch (err) {
      setError(err.mensaje);
    }
  }

  return (
    <div>
      <div className="admin-main__cabecera">
        <h1>Catálogo de productos</h1>
      </div>

      <Alerta tipo="error">{error}</Alerta>
      <Alerta tipo="info">{exito}</Alerta>

      <div className="panel-2col">
        <div className="tarjeta tarjeta-pad">
          <h3>Crear producto</h3>
          <form onSubmit={manejarCrear}>
            <div className="fila-2">
              <div className="campo">
                <label>Código</label>
                <input required value={formCrear.codigo} onChange={(e) => actualizarCrear('codigo', e.target.value)} />
              </div>
              <div className="campo">
                <label>Nombre</label>
                <input required value={formCrear.nombre} onChange={(e) => actualizarCrear('nombre', e.target.value)} />
              </div>
            </div>
            <div className="campo">
              <label>Descripción</label>
              <input value={formCrear.descripcion} onChange={(e) => actualizarCrear('descripcion', e.target.value)} />
            </div>
            <div className="fila-2">
              <div className="campo">
                <label>Categoría</label>
                <select required value={formCrear.idCategoria} onChange={(e) => actualizarCrear('idCategoria', e.target.value)}>
                  <option value="">Selecciona…</option>
                  {categorias.map((c) => (
                    <option key={c.idCategoria} value={c.idCategoria}>
                      {c.nombre}
                    </option>
                  ))}
                </select>
              </div>
              <div className="campo">
                <label>Marca</label>
                <select required value={formCrear.idMarca} onChange={(e) => actualizarCrear('idMarca', e.target.value)}>
                  <option value="">Selecciona…</option>
                  {marcas.map((m) => (
                    <option key={m.idMarca} value={m.idMarca}>
                      {m.nombre}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="fila-2">
              <div className="campo">
                <label>Precio de venta (S/)</label>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  required
                  value={formCrear.precioVenta}
                  onChange={(e) => actualizarCrear('precioVenta', e.target.value)}
                />
              </div>
              <div className="campo">
                <label>Stock inicial</label>
                <input
                  type="number"
                  min={0}
                  required
                  value={formCrear.stock}
                  onChange={(e) => actualizarCrear('stock', e.target.value)}
                />
              </div>
            </div>
            <div className="campo">
              <label>Stock mínimo</label>
              <input
                type="number"
                min={0}
                required
                value={formCrear.stockMinimo}
                onChange={(e) => actualizarCrear('stockMinimo', e.target.value)}
              />
            </div>
            <button type="submit" className="btn btn-primario btn-full" disabled={creando}>
              {creando ? 'Creando…' : 'Crear producto'}
            </button>
          </form>
        </div>

        <div className="tarjeta tarjeta-pad">
          <h3>{formEditar.idProducto ? `Editar producto #${formEditar.idProducto}` : 'Editar producto'}</h3>
          {!formEditar.idProducto ? (
            <p style={{ color: 'var(--gris-500)', fontSize: '0.88rem' }}>
              Selecciona "Editar" en algún producto de la tabla para cargar sus datos aquí.
            </p>
          ) : (
            <form onSubmit={manejarEditar}>
              <div className="fila-2">
                <div className="campo">
                  <label>Código</label>
                  <input
                    required
                    value={formEditar.codigo}
                    onChange={(e) => setFormEditar((p) => ({ ...p, codigo: e.target.value }))}
                  />
                </div>
                <div className="campo">
                  <label>Nombre</label>
                  <input
                    required
                    value={formEditar.nombre}
                    onChange={(e) => setFormEditar((p) => ({ ...p, nombre: e.target.value }))}
                  />
                </div>
              </div>
              <div className="campo">
                <label>Descripción</label>
                <input
                  value={formEditar.descripcion}
                  onChange={(e) => setFormEditar((p) => ({ ...p, descripcion: e.target.value }))}
                />
              </div>
              <div className="fila-2">
                <div className="campo">
                  <label>Categoría</label>
                  <select
                    required
                    value={formEditar.idCategoria}
                    onChange={(e) => setFormEditar((p) => ({ ...p, idCategoria: e.target.value }))}
                  >
                    {categorias.map((c) => (
                      <option key={c.idCategoria} value={c.idCategoria}>
                        {c.nombre}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="campo">
                  <label>Marca</label>
                  <select
                    required
                    value={formEditar.idMarca}
                    onChange={(e) => setFormEditar((p) => ({ ...p, idMarca: e.target.value }))}
                  >
                    {marcas.map((m) => (
                      <option key={m.idMarca} value={m.idMarca}>
                        {m.nombre}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="fila-2">
                <div className="campo">
                  <label>Precio de venta (S/)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    required
                    value={formEditar.precioVenta}
                    onChange={(e) => setFormEditar((p) => ({ ...p, precioVenta: e.target.value }))}
                  />
                </div>
                <div className="campo">
                  <label>Stock mínimo</label>
                  <input
                    type="number"
                    min={0}
                    required
                    value={formEditar.stockMinimo}
                    onChange={(e) => setFormEditar((p) => ({ ...p, stockMinimo: e.target.value }))}
                  />
                </div>
              </div>
              <div style={{ display: 'flex', gap: 10 }}>
                <button type="submit" className="btn btn-primario btn-full" disabled={guardandoEdicion}>
                  {guardandoEdicion ? 'Guardando…' : 'Guardar cambios'}
                </button>
                <button type="button" className="btn btn-fantasma" onClick={cancelarEdicion}>
                  Cancelar
                </button>
              </div>
            </form>
          )}
        </div>
      </div>

      <div className="tarjeta tarjeta-pad" style={{ marginTop: 20, maxWidth: 420 }}>
        <h3>Ajustar stock</h3>
        <form onSubmit={manejarAjustarStock} style={{ display: 'flex', gap: 10, alignItems: 'flex-end' }}>
          <div className="campo" style={{ marginBottom: 0 }}>
            <label>ID de producto</label>
            <input
              type="number"
              required
              value={ajusteStock.idProducto}
              onChange={(e) => setAjusteStock((p) => ({ ...p, idProducto: e.target.value }))}
            />
          </div>
          <div className="campo" style={{ marginBottom: 0 }}>
            <label>Nuevo stock</label>
            <input
              type="number"
              min={0}
              required
              value={ajusteStock.stock}
              onChange={(e) => setAjusteStock((p) => ({ ...p, stock: e.target.value }))}
            />
          </div>
          <button type="submit" className="btn btn-acento">
            Ajustar
          </button>
        </form>
      </div>

      <div className="tarjeta" style={{ marginTop: 20 }}>
        <h3 style={{ padding: '16px 16px 0' }}>Productos en catálogo</h3>
        {cargandoCatalogo ? (
          <Spinner texto="Cargando productos…" />
        ) : catalogo.length === 0 ? (
          <EstadoVacio titulo="Sin productos" descripcion="Aún no hay productos activos en el catálogo." />
        ) : (
          <table className="tabla">
            <thead>
              <tr>
                <th>ID</th>
                <th>Código</th>
                <th>Nombre</th>
                <th>Categoría</th>
                <th>Marca</th>
                <th>Precio</th>
                <th>Stock</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {catalogo.map((p) => (
                <tr key={p.idProducto}>
                  <td className="mono">{p.idProducto}</td>
                  <td className="mono">{p.codigo}</td>
                  <td>{p.nombre}</td>
                  <td>{p.categoria}</td>
                  <td>{p.marca}</td>
                  <td>{formatearMoneda(p.precioVenta)}</td>
                  <td>{p.stock}</td>
                  <td style={{ display: 'flex', gap: 8 }}>
                    <button className="btn btn-fantasma btn-sm" onClick={() => iniciarEdicion(p.idProducto)}>
                      Editar
                    </button>
                    <button className="btn btn-fantasma btn-sm" onClick={() => manejarDesactivar(p.idProducto)}>
                      Desactivar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div className="panel-2col" style={{ marginTop: 20 }}>
        <div className="tarjeta tarjeta-pad">
          <h3>Buscar producto (imágenes)</h3>
          <form onSubmit={buscarProductoImagenes} style={{ display: 'flex', gap: 10 }}>
            <input
              type="number"
              placeholder="ID de producto"
              required
              value={idImagenBuscar}
              onChange={(e) => setIdImagenBuscar(e.target.value)}
            />
            <button type="submit" className="btn btn-primario">
              Buscar
            </button>
          </form>

          {productoImagenes && (
            <div style={{ marginTop: 16 }}>
              <h4 style={{ margin: '0 0 4px' }}>{productoImagenes.nombre}</h4>
              <p className="mono" style={{ color: 'var(--gris-500)', fontSize: '0.8rem' }}>
                {productoImagenes.codigo} · Stock: {productoImagenes.stock}
              </p>
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 10 }}>
                {productoImagenes.imagenes?.length ? (
                  productoImagenes.imagenes.map((img) => (
                    <div key={img.idImagen} style={{ textAlign: 'center', position: 'relative' }}>
                      <img
                        src={urlImagen(img.urlImagen)}
                        alt=""
                        style={{ width: 90, height: 90, objectFit: 'contain', border: '1px solid var(--color-borde)', borderRadius: 6 }}
                      />
                      <button
                        type="button"
                        onClick={() => manejarEliminarImagen(img.idImagen)}
                        aria-label="Eliminar imagen"
                        title="Eliminar imagen"
                        style={{
                          position: 'absolute',
                          top: -6,
                          right: -6,
                          width: 22,
                          height: 22,
                          borderRadius: '50%',
                          border: 'none',
                          background: 'var(--color-peligro)',
                          color: '#fff',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          cursor: 'pointer',
                        }}
                      >
                        <X size={13} />
                      </button>
                      {img.esPrincipal && <div className="badge badge-acento" style={{ marginTop: 4 }}>Principal</div>}
                    </div>
                  ))
                ) : (
                  <p style={{ color: 'var(--gris-500)', fontSize: '0.85rem' }}>Sin imágenes aún.</p>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="tarjeta tarjeta-pad">
          <h3>Agregar imagen</h3>
          {!idImagenBuscar ? (
            <p style={{ color: 'var(--gris-500)', fontSize: '0.88rem' }}>
              Busca un producto en el panel de la izquierda primero.
            </p>
          ) : (
            <form onSubmit={manejarAgregarImagen}>
              <div className="campo">
                <label>URL de la imagen</label>
                <input
                  required
                  placeholder="/img_productos/ejemplo.jpg"
                  value={formImagen.urlImagen}
                  onChange={(e) => setFormImagen((p) => ({ ...p, urlImagen: e.target.value }))}
                />
              </div>
              <div className="fila-2">
                <div className="campo">
                  <label>Orden</label>
                  <input
                    type="number"
                    min={0}
                    value={formImagen.orden}
                    onChange={(e) => setFormImagen((p) => ({ ...p, orden: e.target.value }))}
                  />
                </div>
                <div className="campo" style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 22 }}>
                  <input
                    type="checkbox"
                    id="esPrincipal"
                    style={{ width: 'auto' }}
                    checked={formImagen.esPrincipal}
                    onChange={(e) => setFormImagen((p) => ({ ...p, esPrincipal: e.target.checked }))}
                  />
                  <label htmlFor="esPrincipal" style={{ margin: 0 }}>
                    Marcar como principal
                  </label>
                </div>
              </div>
              <button type="submit" className="btn btn-acento btn-full">
                Agregar imagen
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}