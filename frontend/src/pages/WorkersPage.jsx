import { useEffect, useMemo, useState } from 'react';
import { api } from '../data/api.js';
import Button from '../components/ui/Button';
import WorkerForm from '../components/workers/WorkerForm';
import WorkerCard from '../components/workers/WorkerCard';
import DeleteConfirmationModal from '../components/ui/DeleteConfirmationModal';
import { useWorkers } from "../hooks/useWorkers";

const normalize = (s = "") =>
  s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

const WorkersPage = () => {
  const { items: trabajadores, loading, error, add, edit, remove } = useWorkers();

  // 🔎 NUEVO: departamentos desde la API
  const [departamentos, setDepartamentos] = useState([]);
  const [loadingDeps, setLoadingDeps] = useState(true);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const res = await api("/departments"); // { ok, data: [...] }
        if (alive) setDepartamentos(res?.data ?? []);
      } finally {
        if (alive) setLoadingDeps(false);
      }
    })();
    return () => { alive = false; };
  }, []);

  // diccionario id -> nombre (para mostrar rápido)
  const depNameById = useMemo(
    () => Object.fromEntries(departamentos.map(d => [Number(d.id), d.name])),
    [departamentos]
  );

  const [busqueda, setBusqueda] = useState('');
  const [filtroDepartamento, setFiltroDepartamento] = useState('all'); // "all" | "<id>"
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [modoEdicion, setModoEdicion] = useState(false);
  const [trabajadorAEditar, setTrabajadorAEditar] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [trabajadorAEliminar, setTrabajadorAEliminar] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // ✅ Filtrado por nombre/apellido + department_id
  const trabajadoresFiltrados = (trabajadores || []).filter(trabajador => {
    const coincideBusqueda =
      (trabajador.nombre || '').toLowerCase().includes(busqueda.toLowerCase()) ||
      (trabajador.apellido || '').toLowerCase().includes(busqueda.toLowerCase());

    const coincideDepartamento =
      filtroDepartamento === 'all' ||
      Number(trabajador.department_id) === Number(filtroDepartamento);

    return coincideBusqueda && coincideDepartamento;
  });

  const abrirModalEliminar = (trabajador) => {
    setTrabajadorAEliminar(trabajador);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    if (!trabajadorAEliminar) return;
    setIsDeleting(true);
    try {
      await remove(trabajadorAEliminar.id);
      setShowDeleteModal(false);
    } catch (error) {
      console.error('Error al eliminar:', error);
    } finally {
      setIsDeleting(false);
      setTrabajadorAEliminar(null);
    }
  };

  const handleCancelDelete = () => {
    setShowDeleteModal(false);
    setTrabajadorAEliminar(null);
  };

  const editarTrabajador = (trabajador) => {
    setTrabajadorAEditar(trabajador);
    setModoEdicion(true);
    setMostrarFormulario(true);
  };

  const abrirFormulario = () => {
    setTrabajadorAEditar(null);
    setModoEdicion(false);
    setMostrarFormulario(true);
  };

  const cerrarFormulario = () => {
    setMostrarFormulario(false);
    setTrabajadorAEditar(null);
    setModoEdicion(false);
  };

  const agregarTrabajador = async (nuevoTrabajador) => {
    await add(nuevoTrabajador);
    setMostrarFormulario(false);
  };

  const actualizarTrabajador = async (trabajadorActualizado) => {
    await edit(trabajadorAEditar.id, trabajadorActualizado);
    setMostrarFormulario(false);
    setTrabajadorAEditar(null);
    setModoEdicion(false);
  };

  const formatearPago = (pago) =>
    new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(pago);

  // ✅ Ahora recibe un ID y devuelve el nombre real
  const obtenerNombreDepartamento = (dep) => {
    if (dep == null) return "Sin departamento";
    const id = Number(dep);
    return depNameById[id] ?? "Sin departamento";
  };

  // ✅ Color por nombre real (normalizado); fallback gris
  const obtenerColorDepartamento = (dep) => {
    const nombre = obtenerNombreDepartamento(dep);
    const key = normalize(nombre);
    const colores = {
      produccion: 'bg-blue-100 text-blue-800',
      ventas: 'bg-green-100 text-green-800',
      administracion: 'bg-purple-100 text-purple-800',
      logistica: 'bg-yellow-100 text-yellow-800',
      'recursos humanos': 'bg-pink-100 text-pink-800',
      rrhh: 'bg-pink-100 text-pink-800',
    };
    return colores[key] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Gestión de Trabajadores</h1>
            <p className="text-gray-600">Administra los trabajadores de tu empresa</p>
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
            Agregar Trabajador
          </Button>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-4 md:p-6 mb-6">
          <div className="flex flex-col md:flex-row md:items-center gap-4">
            <div className="flex-1">
              <label htmlFor="busqueda" className="block text-sm font-medium text-gray-700 mb-1">
                Buscar trabajador
              </label>
              <input
                type="text"
                id="busqueda"
                placeholder="Buscar por nombre o apellido..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#209E7F] focus:border-transparent"
              />
            </div>

            <div className="w-full md:w-56">
              <label htmlFor="filtro-departamento" className="block text-sm font-medium text-gray-700 mb-1">
                Filtrar por departamento
              </label>
              <select
                id="filtro-departamento"
                value={filtroDepartamento}
                onChange={(e) => setFiltroDepartamento(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#209E7F] focus:border-transparent"
                disabled={loadingDeps}
              >
                <option value="all">{loadingDeps ? "Cargando..." : "Todos los departamentos"}</option>
                {!loadingDeps && departamentos.map((dep) => (
                  <option key={dep.id} value={String(dep.id)}>
                    {dep.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-4 md:p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-semibold text-gray-800">Lista de Trabajadores</h2>
            <span className="text-sm text-gray-600">
              {trabajadoresFiltrados.length} {trabajadoresFiltrados.length === 1 ? 'trabajador' : 'trabajadores'}
            </span>
          </div>

          {loading && <p className="text-gray-600 mb-4">Cargando trabajadores…</p>}
          {error && <p className="text-red-600 mb-4">Error: {error}</p>}

          {!loading && trabajadoresFiltrados.length > 0 ? (
            <div>
              {trabajadoresFiltrados.map((trabajador) => (
                <WorkerCard
                  key={trabajador.id}
                  trabajador={trabajador}
                  onEdit={editarTrabajador}
                  onDelete={abrirModalEliminar}
                  formatearPago={formatearPago}
                  obtenerNombreDepartamento={obtenerNombreDepartamento}   // ahora funciona con ID
                  obtenerColorDepartamento={obtenerColorDepartamento}     // color por nombre real
                />
              ))}
            </div>
          ) : !loading ? (
            <div className="text-center py-12">
              <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No se encontraron trabajadores</h3>
              <p className="text-gray-500">Intenta con otros términos de búsqueda o ajusta los filtros.</p>
            </div>
          ) : null}
        </div>
      </div>

      {mostrarFormulario && (
        <WorkerForm
          onClose={cerrarFormulario}
          onSubmit={modoEdicion ? actualizarTrabajador : agregarTrabajador}
          initialData={trabajadorAEditar}
          isEdit={modoEdicion}
        />
      )}

      <DeleteConfirmationModal
        isOpen={showDeleteModal}
        onClose={handleCancelDelete}
        onConfirm={handleConfirmDelete}
        itemName={trabajadorAEliminar ? `${trabajadorAEliminar.nombre} ${trabajadorAEliminar.apellido}` : ''}
        loading={isDeleting}
      />
    </div>
  );
};

export default WorkersPage;
