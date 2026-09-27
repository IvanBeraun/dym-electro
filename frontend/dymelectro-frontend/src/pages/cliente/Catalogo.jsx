import { useEffect, useMemo, useState } from 'react';
import { listarCatalogo, buscarCatalogo } from '../../api/catalogo.api';
import ProductoCard from '../../components/ProductoCard';
import Spinner from '../../components/ui/Spinner';
import EstadoVacio from '../../components/ui/EstadoVacio';
import Alerta from '../../components/ui/Alerta';

export default function Catalogo() {
  const [productos, setProductos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const [texto, setTexto] = useState('');
  const [categoriaSel, setCategoriaSel] = useState('');
  const [marcaSel, setMarcaSel] = useState('');

  useEffect(() => {
    cargarTodo();
  }, []);

  async function cargarTodo() {
    setCargando(true);
    setError('');
    try {
      const data = await listarCatalogo();
      setProductos(data);
    } catch (err) {
      setError(err.mensaje);
    } finally {
      setCargando(false);
    }
  }

  async function manejarBusqueda(e) {
    e.preventDefault();
    setCargando(true);
    setError('');
    try {
      const data = texto.trim() ? await buscarCatalogo(texto.trim()) : await listarCatalogo();
      setProductos(data);
      setCategoriaSel('');
      setMarcaSel('');
    } catch (err) {
      setError(err.mensaje);
    } finally {
      setCargando(false);
    }
  }

  // El backend no expone un listado de categorias/marcas con su ID (solo
  // /catalogo/filtrar por idCategoria/idMarca), asi que estas opciones se
  // derivan de los propios productos cargados y el filtro se aplica en el
  // cliente. Si se agrega GET /api/categorias y /api/marcas, esto se puede
  // reemplazar por catalogoService.filtrar() con los IDs reales.
  const categorias = useMemo(
    () => [...new Set(productos.map((p) => p.categoria).filter(Boolean))].sort(),
    [productos]
  );
  const marcas = useMemo(
    () => [...new Set(productos.map((p) => p.marca).filter(Boolean))].sort(),
    [productos]
  );

  const visibles = productos.filter(
    (p) => (!categoriaSel || p.categoria === categoriaSel) && (!marcaSel || p.marca === marcaSel)
  );

  return (
    <div>
      <div className="catalogo-cabecera">
        <div>
          <h1>Catálogo de productos</h1>
          <p style={{ color: 'var(--gris-500)', maxWidth: 520 }}>
            Materiales, equipos industriales y repuestos eléctricos de D&M Electro Soluciones y Proyectos.
          </p>
        </div>
        <form className="catalogo-buscador" onSubmit={manejarBusqueda}>
          <input
            type="search"
            placeholder="Buscar por nombre, código…"
            value={texto}
            onChange={(e) => setTexto(e.target.value)}
          />
          <button type="submit" className="btn btn-primario btn-sm">
            Buscar
          </button>
        </form>
      </div>

      <div className="catalogo-filtros">
        <select value={categoriaSel} onChange={(e) => setCategoriaSel(e.target.value)}>
          <option value="">Todas las categorías</option>
          {categorias.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
        <select value={marcaSel} onChange={(e) => setMarcaSel(e.target.value)}>
          <option value="">Todas las marcas</option>
          {marcas.map((m) => (
            <option key={m} value={m}>
              {m}
            </option>
          ))}
        </select>
        {(categoriaSel || marcaSel) && (
          <button
            className="btn btn-fantasma btn-sm"
            onClick={() => {
              setCategoriaSel('');
              setMarcaSel('');
            }}
          >
            Limpiar filtros
          </button>
        )}
      </div>

      <Alerta tipo="error">{error}</Alerta>

      {cargando ? (
        <Spinner texto="Cargando catálogo…" />
      ) : visibles.length === 0 ? (
        <EstadoVacio titulo="Sin resultados" descripcion="Prueba con otra búsqueda o quita los filtros." />
      ) : (
        <div className="grilla-productos">
          {visibles.map((p) => (
            <ProductoCard key={p.idProducto} producto={p} />
          ))}
        </div>
      )}
    </div>
  );
}
