import { useState, useRef, useEffect } from 'react';

const WorkerCard = ({
  trabajador,
  onEdit,
  onDelete,
  formatearPago,
  obtenerNombreDepartamento,
}) => {
  const [dropdownAbierto, setDropdownAbierto] = useState(false);
  const dropdownRef = useRef(null);

  const toggleDropdown = (event) => {
    event.stopPropagation();
    setDropdownAbierto((v) => !v);
  };

  const handleClickOutside = (event) => {
    if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
      setDropdownAbierto(false);
    }
  };

  useEffect(() => {
    if (dropdownAbierto) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [dropdownAbierto]);

  return (
    <div className="bg-white rounded-xl shadow-sm p-5 mb-4 hover:shadow-md transition-shadow">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
          <div className="min-w-0">
            <h3 className="text-lg font-semibold text-gray-800 mb-1">
              {trabajador.nombre} {trabajador.apellido}
            </h3>
          </div>

          <div className="min-w-0">
            <p className="text-sm text-gray-600 mb-1">Departamento</p>
            <span className="text-gray-800 font-medium">
              {/* usa el nombre que viene del backend mapeado */}
              {trabajador.departamentoNombre ||
                obtenerNombreDepartamento?.(trabajador.departamentoClave) ||
                'Sin departamento'}
            </span>
          </div>

          <div className="min-w-0">
            <p className="text-sm text-gray-600 mb-1">Pago por hora</p>
            <span className="text-lg font-semibold text-gray-800">
              {formatearPago(Number(trabajador.pagoPorHora) || 0)}
            </span>
          </div>
        </div>

        <div className="flex-shrink-0 relative" ref={dropdownRef}>
          <button
            onClick={toggleDropdown}
            className="inline-flex items-center p-2 text-sm font-medium text-center text-gray-500 bg-white rounded-lg hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-50"
            type="button"
          >
            <svg className="w-5 h-5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 4 15">
              <path d="M3.5 1.5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0Zm0 6.041a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0Zm0 5.959a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0Z"/>
            </svg>
          </button>

          {dropdownAbierto && (
            <div className="absolute right-0 z-50 w-40 mt-1 origin-top-right bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
              <div className="py-1">
                <button
                  onClick={() => { onEdit(trabajador); setDropdownAbierto(false); }}
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                >
                  Editar
                </button>
                <button
                  onClick={() => { onDelete(trabajador); setDropdownAbierto(false); }}
                  className="block px-4 py-2 text-sm text-red-600 hover:bg-gray-100 w-full text-left"
                >
                  Eliminar
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default WorkerCard;
