import { useState } from 'react';
import Button from '../components/ui/Button';
import MaterialCard from '../components/materials/MaterialCard';
import MaterialDetails from '../components/materials/MaterialDetails';
import MaterialForm from '../components/materials/MaterialForm';
import { useMaterials } from "../hooks/useMaterials";

const MaterialsPage = () => {
  const { items: materiales, loading, error, add, edit, remove } = useMaterials();

  const [busqueda, setBusqueda] = useState('');
  const [filtroTipo, setFiltroTipo] = useState('todos');
  const [paginaActual, setPaginaActual] = useState(1);
  const [materialesPorPagina] = useState(8);
  const [vistaDetalle, setVistaDetalle] = useState(false);
  const [materialSeleccionado, setMaterialSeleccionado] = useState(null);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [modoEdicion, setModoEdicion] = useState(false);
  const [materialAEditar, setMaterialAEditar] = useState(null);

  const materialesFiltrados = materiales.filter(material => {
    const coincideBusqueda =
      (material.nombre || "").toLowerCase().includes(busqueda.toLowerCase()) ||
      (material.descripcion || "").toLowerCase().includes(busqueda.toLowerCase());
    const coincideTipo = filtroTipo === 'todos' || material.tipo === filtroTipo;
    return coincideBusqueda && coincideTipo;
  });

  const indiceUltimoMaterial = paginaActual * materialesPorPagina;
  const indicePrimerMaterial = indiceUltimoMaterial - materialesPorPagina;
  const materialesActuales = materialesFiltrados.slice(indicePrimerMaterial, indiceUltimoMaterial);
  const totalPaginas = Math.ceil(materialesFiltrados.length / materialesPorPagina);

  const cambiarPagina = (numeroPagina) => {
    setPaginaActual(numeroPagina);
    window.scrollTo(0, 0);
  };

  const eliminarMaterial = async (id) => {
    await remove(id);
    setVistaDetalle(false);
    setMaterialSeleccionado(null);
  };

  const editarMaterial = (material) => {
    setMaterialAEditar(material);
    setModoEdicion(true);
    setMostrarFormulario(true);
    setVistaDetalle(false);
  };

  const verDetalles = (material) => {
    setMaterialSeleccionado(material);
    setVistaDetalle(true);
  };

  const cerrarDetalles = () => {
    setVistaDetalle(false);
    setMaterialSeleccionado(null);
  };

  const abrirFormulario = () => {
    setMaterialAEditar(null);
    setModoEdicion(false);
    setMostrarFormulario(true);
  };

  const cerrarFormulario = () => {
    setMostrarFormulario(false);
    setMaterialAEditar(null);
    setModoEdicion(false);
  };

  const agregarMaterial = async (formUI) => {
    const creado = await add(formUI);
    setMostrarFormulario(false);
    console.log("Material creado:", creado);
  };

  const actualizarMaterial = async (formUI) => {
    if (!materialAEditar) return;
    const actualizado = await edit(materialAEditar.id, formUI);
    setMostrarFormulario(false);
    setMaterialAEditar(null);
    setModoEdicion(false);
    if (vistaDetalle && materialSeleccionado && materialSeleccionado.id === actualizado.id) {
      setMaterialSeleccionado(actualizado);
    }
    console.log("Material actualizado:", actualizado);
  };

  const formatearPrecio = (precio) =>
    new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(precio || 0);

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">

        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Inventario de Materiales</h1>
            <p className="text-gray-600">Gestiona y revisa todos los materiales disponibles</p>
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
            Agregar Material
          </Button>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-4 md:p-6 mb-6">
          <div className="flex flex-col md:flex-row md:items-center gap-4 mb-4">
            <div className="flex-1">
              <label htmlFor="busqueda" className="block text-sm font-medium text-gray-700 mb-1">
                Buscar material
              </label>
              <input
                type="text"
                id="busqueda"
                placeholder="Buscar por nombre o descripción..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#209E7F] focus:border-transparent"
              />
            </div>

            <div className="w-full md:w-48">
              <label htmlFor="filtro-tipo" className="block text-sm font-medium text-gray-700 mb-1">
                Filtrar por tipo
              </label>
              <select
                id="filtro-tipo"
                value={filtroTipo}
                onChange={(e) => setFiltroTipo(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#209E7F] focus:border-transparent"
              >
                <option value="todos">Todos los tipos</option>
                <option value="madera">Madera</option>
                <option value="textil">Textil</option>
                <option value="cuero">Cuero</option>
                <option value="alimento">Alimento</option>
                <option value="sin etiqueta">Sin etiqueta</option>
              </select>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="bg-white rounded-xl shadow-sm p-8 text-center text-gray-600">
            Cargando...
          </div>
        ) : error ? (
          <div className="bg-white rounded-xl shadow-sm p-8 text-center text-red-600">
            {error}
          </div>
        ) : materialesFiltrados.length > 0 ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
              {materialesActuales.map(material => (
                <MaterialCard
                  key={material.id}
                  material={material}
                  onVerDetalles={verDetalles}
                  formatearPrecio={formatearPrecio}
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
            <h3 className="text-lg font-medium text-gray-900 mb-2">No se encontraron materiales</h3>
            <p className="text-gray-500">Intenta con otros términos de búsqueda o ajusta los filtros.</p>
          </div>
        )}
      </div>

      {mostrarFormulario && (
        <MaterialForm
          onClose={cerrarFormulario}
          onSubmit={modoEdicion ? actualizarMaterial : agregarMaterial}
          initialData={materialAEditar}
          isEdit={modoEdicion}
        />
      )}

      {vistaDetalle && materialSeleccionado && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-3xl max-h-[70vh] overflow-y-auto">
            <MaterialDetails
              material={materialSeleccionado}
              onCerrar={cerrarDetalles}
              onEditar={editarMaterial}
              onEliminar={eliminarMaterial}
              formatearPrecio={formatearPrecio}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default MaterialsPage;
