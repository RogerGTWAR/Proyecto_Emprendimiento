import { useState } from 'react';
import ProductsCard from '../components/products/ProductsCard';
import ProductsDetails from '../components/products/ProductsDetails';
import ProductForm from '../components/products/ProductForm';
import Button from '../components/ui/Button';
import { useProducts } from '../hooks/useProducts';
import { fetchProductById } from '../data/products'; 

const ProductsPage = () => {
  const { items: products, loading, error, add, edit, remove } = useProducts();

  const [busqueda, setBusqueda] = useState('');
  const [paginaActual, setPaginaActual] = useState(1);
  const productsPorPagina = 8;

  const [vistaDetalle, setVistaDetalle] = useState(false);
  const [productoSeleccionado, setProductoSeleccionado] = useState(null);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [modoEdicion, setModoEdicion] = useState(false);
  const [productoAEditar, setProductoAEditar] = useState(null);

  const productosFiltrados = products.filter((prod) => {
    const q = busqueda.toLowerCase();
    const nombre = (prod.nombre || '').toLowerCase();
    const descripcion = (prod.descripcion || '').toLowerCase();
    return nombre.includes(q) || descripcion.includes(q);
  });

  const indiceUltimoProducto = paginaActual * productsPorPagina;
  const indicePrimerProducto = indiceUltimoProducto - productsPorPagina;
  const productosActuales = productosFiltrados.slice(indicePrimerProducto, indiceUltimoProducto);
  const totalPaginas = Math.ceil(productosFiltrados.length / productsPorPagina);

  const cambiarPagina = (numeroPagina) => {
    if (numeroPagina < 1 || numeroPagina > totalPaginas) return;
    setPaginaActual(numeroPagina);
    window.scrollTo(0, 0);
  };

  const eliminarProducto = async (id) => {
    await remove(id);
    cerrarDetalles();
  };

const verDetalles = async (producto) => {
  try {
    const detalle = await fetchProductById(producto.id);
    setProductoSeleccionado(detalle);
    setVistaDetalle(true);
  } catch (e) {
    console.error(e);
  }
};
  const cerrarDetalles = () => {
    setVistaDetalle(false);
    setProductoSeleccionado(null);
  };

  const abrirFormulario = () => {
    setProductoAEditar(null);
    setModoEdicion(false);
    setMostrarFormulario(true);
  };

  const cerrarFormulario = () => {
    setMostrarFormulario(false);
    setProductoAEditar(null);
    setModoEdicion(false);
  };

  const editarProducto = (producto) => {
    setProductoAEditar(producto);
    setModoEdicion(true);
    setMostrarFormulario(true);
    setVistaDetalle(false);
  };

  const agregarProducto = async (nuevoProductoUI) => {
    const creado = await add(nuevoProductoUI);
    setMostrarFormulario(false);
    console.log('Producto agregado:', creado);
  };

  const actualizarProducto = async (productoActualizadoUI) => {
    if (!productoAEditar) return;
    const actualizado = await edit(productoAEditar.id, productoActualizadoUI);
    setMostrarFormulario(false);
    setProductoAEditar(null);
    setModoEdicion(false);

    if (vistaDetalle && productoSeleccionado && productoSeleccionado.id === actualizado.id) {
      setProductoSeleccionado(actualizado);
    }
    console.log('Producto actualizado:', actualizado);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Mis Productos</h1>
            <p className="text-gray-600">Gestiona y revisa todos los productos creados</p>
          </div>

          <Button
            onClick={abrirFormulario}
            variant="blue"
            icon={
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            }
            className="whitespace-nowrap"
          >
            Agregar Producto
          </Button>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-4 md:p-6 mb-6">
          <div className="flex flex-col md:flex-row md:items-center gap-4">
            <div className="flex-1">
              <label htmlFor="busqueda-productos" className="block text-sm font-medium text-gray-700 mb-1">
                Buscar producto
              </label>
              <input
                type="text"
                id="busqueda-productos"
                placeholder="Buscar por nombre o descripción..."
                value={busqueda}
                onChange={(e) => {
                  setBusqueda(e.target.value);
                  setPaginaActual(1);
                }}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#209E7F] focus:border-transparent"
              />
            </div>

            <div className="w-full md:w-auto">
              <div className="text-sm text-gray-600 bg-gray-50 px-3 py-2 rounded-lg">
                {productosFiltrados.length} producto
                {productosFiltrados.length !== 1 ? 's' : ''} encontrado
                {productosFiltrados.length !== 1 ? 's' : ''}
              </div>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="bg-white rounded-xl shadow-sm p-8 text-center text-gray-600">Cargando...</div>
        ) : error ? (
          <div className="bg-white rounded-xl shadow-sm p-8 text-center text-red-600">{error}</div>
        ) : productosActuales.length > 0 ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
              {productosActuales.map((producto) => (
                <ProductsCard
                  key={producto.id}
                  products={producto}
                  onVerDetalles={verDetalles}
                />
              ))}
            </div>

            {totalPaginas > 1 && (
              <div className="flex justify-center items-center space-x-2 mb-8">
                <button
                  onClick={() => cambiarPagina(paginaActual - 1)}
                  disabled={paginaActual === 1}
                  className="px-3 py-1 rounded-lg border border-gray-300 text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
                >
                  Anterior
                </button>

                {Array.from({ length: totalPaginas }, (_, i) => i + 1).map((numero) => (
                  <button
                    key={numero}
                    onClick={() => cambiarPagina(numero)}
                    className={`px-3 py-1 rounded-lg ${
                      paginaActual === numero
                        ? 'bg-[#3B6DB3] text-white'
                        : 'border border-gray-300 text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    {numero}
                  </button>
                ))}

                <button
                  onClick={() => cambiarPagina(paginaActual + 1)}
                  disabled={paginaActual === totalPaginas}
                  className="px-3 py-1 rounded-lg border border-gray-300 text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
                >
                  Siguiente
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="bg-white rounded-xl shadow-sm p-8 text-center">
            <svg
              className="w-16 h-16 text-gray-400 mx-auto mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-16M9 9h6m-6 4h6m-6 4h6"
              />
            </svg>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {busqueda ? 'No se encontraron productos' : 'No hay productos'}
            </h3>
            <p className="text-gray-500 mb-4">
              {busqueda
                ? `No hay resultados para "${busqueda}". Intenta con otros términos.`
                : 'Aún no has creado ningún producto.'}
            </p>
            <button
              onClick={abrirFormulario}
              className="bg-[#3B6DB3] text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-[#2D5599] transition-colors mx-auto"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              {busqueda ? 'Crear nuevo producto' : 'Crear primer producto'}
            </button>
          </div>
        )}
      </div>

      {vistaDetalle && productoSeleccionado && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-3xl max-h-[70vh] overflow-y-auto">
            <ProductsDetails
              products={productoSeleccionado}
              onCerrar={cerrarDetalles}
              onEliminar={eliminarProducto}
              onEditar={editarProducto}
            />
          </div>
        </div>
      )}

      {mostrarFormulario && (
        <ProductForm
          onClose={cerrarFormulario}
          onSubmit={modoEdicion ? actualizarProducto : agregarProducto}
          initialData={productoAEditar}
          isEdit={modoEdicion}
        />
      )}
    </div>
  );
};

export default ProductsPage;
