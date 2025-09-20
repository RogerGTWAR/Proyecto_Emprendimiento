import { useState, useRef } from 'react';

const WorkerCard = ({ 
  trabajador, 
  onEdit, 
  onDelete, 
  formatearPago, 
  obtenerNombreDepartamento 
}) => {
  const [dropdownAbierto, setDropdownAbierto] = useState(false);
  const dropdownRef = useRef(null);

  const toggleDropdown = (event) => {
    event.stopPropagation();
    setDropdownAbierto(!dropdownAbierto);
  };

  const handleClickOutside = (event) => {
    if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
      setDropdownAbierto(false);
    }
  };

  useState(() => {
    if (dropdownAbierto) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
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
              {obtenerNombreDepartamento(trabajador.departamento)}
            </span>
          </div>

          <div className="min-w-0">
            <p className="text-sm text-gray-600 mb-1">Pago por hora</p>
            <span className="text-lg font-semibold text-gray-800">
              {formatearPago(trabajador.pago)}
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
                  onClick={() => {
                    onEdit(trabajador);
                    setDropdownAbierto(false);
                  }}
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                >
                  <div className="flex items-center">
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    Editar
                  </div>
                </button>
                <button
                  onClick={() => {
                    onDelete(trabajador);
                    setDropdownAbierto(false);
                  }}
                  className="block px-4 py-2 text-sm text-red-600 hover:bg-gray-100 w-full text-left"
                >
                  <div className="flex items-center">
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    Eliminar
                  </div>
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