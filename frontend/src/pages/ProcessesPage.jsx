import { useState } from 'react';
import Button from '../components/ui/Button';
import ProcessForm from '../components/processes/ProcessForm';
import ProcessCard from '../components/processes/ProcessCard';

const ProcessesPage = () => {
  const [processes, setProcesses] = useState([]);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [procesoAEditar, setProcesoAEditar] = useState(null);
  const [busqueda, setBusqueda] = useState('');
  const [paginaActual, setPaginaActual] = useState(1);
  const [processesPorPagina] = useState(8);

  const procesosFiltrados = processes.filter(proceso => {
    return proceso.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
           (proceso.descripcion && proceso.descripcion.toLowerCase().includes(busqueda.toLowerCase()));
  });

  const indiceUltimoProcess = paginaActual * processesPorPagina;
  const indicePrimerProcess = indiceUltimoProcess - processesPorPagina;
  const procesosActuales = procesosFiltrados.slice(indicePrimerProcess, indiceUltimoProcess);
  const totalPaginas = Math.ceil(procesosFiltrados.length / processesPorPagina);

  const cambiarPagina = (numeroPagina) => {
    setPaginaActual(numeroPagina);
    window.scrollTo(0, 0);
  };

  const abrirFormulario = () => {
    setProcesoAEditar(null);
    setMostrarFormulario(true);
  };

  const cerrarFormulario = () => {
    setMostrarFormulario(false);
    setProcesoAEditar(null);
  };

  const agregarProceso = (nuevoProceso) => {
    const nuevoProcesoConId = {
      ...nuevoProceso,
      id: processes.length > 0 ? Math.max(...processes.map(p => p.id)) + 1 : 1,
    };
    
    setProcesses([...processes, nuevoProcesoConId]);
    setMostrarFormulario(false);
  };

  const editarProceso = (proceso) => {
    setProcesoAEditar(proceso);
    setMostrarFormulario(true);
  };

  const actualizarProceso = (procesoActualizado) => {
    const procesosActualizados = processes.map(proceso => 
      proceso.id === procesoAEditar.id 
        ? { ...procesoActualizado, id: procesoAEditar.id }
        : proceso
    );
    
    setProcesses(procesosActualizados);
    setMostrarFormulario(false);
    setProcesoAEditar(null);
  };

  const eliminarProceso = (id) => {
    setProcesses(processes.filter(proceso => proceso.id !== id));
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">

        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Procesos de Producción</h1>
            <p className="text-gray-600">Gestiona y revisa todos los procesos de producción</p>
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
            Agregar Proceso
          </Button>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-4 md:p-6 mb-6">
          <div className="flex flex-col md:flex-row md:items-center gap-4">
            <div className="flex-1">
              <label htmlFor="busqueda" className="block text-sm font-medium text-gray-700 mb-1">
                Buscar proceso
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
          </div>
        </div>

        {procesosFiltrados.length > 0 ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
              {procesosActuales.map((proceso) => (
                <ProcessCard
                  key={proceso.id}
                  process={proceso}
                  onEdit={editarProceso}
                  onDelete={eliminarProceso}
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
            <div className="w-16 h-16 text-gray-400 mx-auto mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-full h-full">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
              </svg>
            </div>
            
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {busqueda ? 'No se encontraron procesos' : 'No hay procesos creados'}
            </h3>
            <p className="text-gray-500">
              {busqueda ? 'Intenta con otros términos de búsqueda.' : 'Comienza creando tu primer proceso de producción.'}
            </p>
             
          </div>
        )}

      </div>

      {mostrarFormulario && (
        <ProcessForm
          onClose={cerrarFormulario}
          onSubmit={procesoAEditar ? actualizarProceso : agregarProceso}
          initialData={procesoAEditar}
          isEdit={!!procesoAEditar}
        />
      )}
    </div>
  );
};

export default ProcessesPage;