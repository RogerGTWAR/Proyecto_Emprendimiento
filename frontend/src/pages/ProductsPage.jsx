import { useState } from 'react';
import ProductsCard from '../components/products/ProductsCard';
import ProductsDetails from '../components/products/ProductsDetails';
import { productsPrueba } from '../data/productsData';

const ProductsPage = () => {
  const [products, setProducts] = useState(productsPrueba);
  const [paginaActual, setPaginaActual] = useState(1);
  const productsPorPagina = 8;
  const [vistaDetalle, setVistaDetalle] = useState(false);
  const [productoSeleccionado, setProductoSeleccionado] = useState(null);

  // Filtrar solo productos activos
  const productosActivos = products.filter(prod => prod.activo !== 0);

  // Calcular índices para paginación
  const indiceUltimoProducto = paginaActual * productsPorPagina;
  const indicePrimerProducto = indiceUltimoProducto - productsPorPagina;

  // Productos a mostrar en la página actual
  const productosActuales = productosActivos.slice(indicePrimerProducto, indiceUltimoProducto);

  // Total de páginas según productos activos
  const totalPaginas = Math.ceil(productosActivos.length / productsPorPagina);

  // Cambiar página
  const cambiarPagina = (numeroPagina) => {
    if (numeroPagina < 1 || numeroPagina > totalPaginas) return;
    setPaginaActual(numeroPagina);
    window.scrollTo(0, 0);
  };

  // Cambiar estado del producto a "eliminado" (activo = 0)
  const eliminarProducto = (id) => {
    setProducts((prevProducts) =>
      prevProducts.map((prod) =>
        prod.id === id ? { ...prod, activo: 0 } : prod
      )
    );
    cerrarDetalles();
  };

  // Ver detalles
  const verDetalles = (producto) => {
    setProductoSeleccionado(producto);
    setVistaDetalle(true);
  };

  // Cerrar detalles
  const cerrarDetalles = () => {
    setVistaDetalle(false);
    setProductoSeleccionado(null);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">

        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Mis Productos</h1>
            <p className="text-gray-600">Gestiona y revisa todos los productos creados</p>
          </div>
        </div>

        {/* Grid de productos */}
        {productosActuales.length > 0 ? (
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
            <h3 className="text-lg font-medium text-gray-900 mb-2">No se encontraron productos</h3>
            <p className="text-gray-500">No hay productos activos para mostrar.</p>
          </div>
        )}

      </div>

      {/* Modal de detalles del producto */}
      {vistaDetalle && productoSeleccionado && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-3xl max-h-[70vh] overflow-y-auto">
            <ProductsDetails
              products={productoSeleccionado}
              onCerrar={cerrarDetalles}
              onEliminar={eliminarProducto}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductsPage;