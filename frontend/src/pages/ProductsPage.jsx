import { useState } from 'react';
import Button from '../components/ui/Button';
import IconButton from '../components/ui/Buscador';
import ProductsCard from '../components/products/ProductsCard';
import ProductsDetails from '../components/products/ProductsDetails';
import { productsPrueba } from '../data/productsData';

const ProductsPage = () => {
  const [products, setProducts] = useState(productsPrueba);
  const [busqueda, setBusqueda] = useState('');
  const [paginaActual, setPaginaActual] = useState(1);
  const [productsesPorPagina] = useState(8);
  const [vistaDetalle, setVistaDetalle] = useState(false);
  const [productsSeleccionado, setproductsSeleccionado] = useState(null);

  // Calcular paginas
  const indiceUltimoproducts = paginaActual * productsesPorPagina;
  const indicePrimerproducts = indiceUltimoproducts - productsesPorPagina;
  const productsesActuales = productsesFiltrados.slice(indicePrimerproducts, indiceUltimoproducts);
  const totalPaginas = Math.ceil(productsesFiltrados.length / productsesPorPagina);

  // Cambiar pagina
  const cambiarPagina = (numeroPagina) => {
    setPaginaActual(numeroPagina);
    window.scrollTo(0, 0);
  };

  // Eliminar products
  const eliminarproducts = (id) => {
    setProducts(products.filter(products => products.id !== id));
    setVistaDetalle(false);
    setproductsSeleccionado(null);
  };

  // Ver detalles
  const verDetalles = (products) => {
    setproductsSeleccionado(products);
    setVistaDetalle(true);
  };

  // Cerrar vista de detalles
  const cerrarDetalles = () => {
    setVistaDetalle(false);
    setproductsSeleccionado(null);
  };

  // Cerrar formulario
  const cerrarFormulario = () => {
    setMostrarFormulario(false);
    setproductsAEditar(null);
    setModoEdicion(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">

        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Mis Productos</h1>
            <p className="text-gray-600">Gestiona y revisa todos los productos disponibles</p>
          </div>
        </div>


        <div className="bg-white rounded-xl shadow-sm p-4 md:p-6 mb-6">
          <div className="flex flex-col md:flex-row md:items-center gap-4 mb-4">
            <div className="flex-1">
              <input
                type="text"
                id="busqueda"
                placeholder="Buscar por nombre o descripción..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#209E7F] focus:border-transparent"
              />
              <IconButton onClick={handleSearch} aria-label="Buscar" />
            </div>

          </div>
        </div>

        {/* Grid de products */}
        {products.length > 0 ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
              {productsActuales.map(products => (
                <productsCard
                  key={products.id}
                  products={products}
                  onVerDetalles={verDetalles}
                  formatearPrecio={formatearPrecio}
                />
              ))}
            </div>

            {/* Paginación */}
            {totalPaginas > 1 && (
              <div className="flex justify-center items-center space-x-2 mb-8">
                <button
                  onClick={() => cambiarPagina(paginaActual - 1)}
                  disabled={paginaActual === 1}
                  className="px-3 py-1 rounded-lg border border-gray-300 text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
                >
                  Anterior
                </button>

                {Array.from({ length: totalPaginas }, (_, i) => i + 1).map(numero => (
                  <button
                    key={numero}
                    onClick={() => cambiarPagina(numero)}
                    className={`px-3 py-1 rounded-lg ${paginaActual === numero ? 'bg-[#3B6DB3] text-white' : 'border border-gray-300 text-gray-700 hover:bg-gray-100'}`}
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
            <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-16M9 9h6m-6 4h6m-6 4h6" />
            </svg>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No se encontraron products</h3>
            <p className="text-gray-500">Intenta con otros términos de búsqueda o ajusta los filtros.</p>
          </div>
        )}
      </div>

      {/* Modal del formulario */}
      {mostrarFormulario && (
        <productsForm
          onClose={cerrarFormulario}
          onSubmit={modoEdicion ? actualizarproducts : agregarproducts}
          initialData={productsAEditar}
          isEdit={modoEdicion}
        />
      )}

      {/* Modal de detalles del products */}
      {vistaDetalle && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-3xl max-h-[70vh] overflow-y-auto">
            <productsDetails
              products={productsSeleccionado}
              onCerrar={cerrarDetalles}
              onEditar={editarproducts}
              onEliminar={eliminarproducts}
              formatearPrecio={formatearPrecio}
            />
          </div>
        </div>
      )}
    </div>
  );
};
export default ProductsPage;
