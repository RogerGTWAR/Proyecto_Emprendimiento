import { useState, useRef, useEffect } from 'react';

const formatearMoneda = (monto) =>
  new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(Number(monto || 0));

const ServiceCard = ({
  service,
  onRemove,
  deleting = false, 
}) => {
  const [dropdownAbierto, setDropdownAbierto] = useState(false);
  const dropdownRef = useRef(null);

  const toggleDropdown = (event) => {
    event.stopPropagation();
    if (!deleting) setDropdownAbierto(!dropdownAbierto);
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
    <div className={`bg-white border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow ${deleting ? 'opacity-60' : ''}`}>
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium text-gray-600">{service.nombre}</h4>
            </div>
            <span className="text-lg font-semibold text-gray-600">
              {formatearMoneda(service.monto)}
            </span>
          </div>
        </div>

        <div className="flex-shrink-0 relative" ref={dropdownRef}>
          <button
            onClick={toggleDropdown}
            className="inline-flex items-center p-2 text-sm font-medium text-center text-gray-500 bg-white rounded-lg hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-50 disabled:opacity-50"
            type="button"
            disabled={deleting}
            aria-label="Opciones del servicio"
          >
            <svg className="w-5 h-5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 4 15">
              <path d="M3.5 1.5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0Zm0 6.041a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0Zm0 5.959a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0Z"/>
            </svg>
          </button>

          {dropdownAbierto && (
            <div className="absolute right-0 z-50 w-44 mt-1 origin-top-right bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
              <div className="py-1">
                <button
                  onClick={() => {
                    if (!deleting) onRemove(service.id);
                    setDropdownAbierto(false);
                  }}
                  className="block px-4 py-2 text-sm w-full text-left hover:bg-gray-100 disabled:opacity-60"
                  disabled={deleting}
                >
                  <div className="flex items-center text-red-600">
                    {deleting ? (
                      <>
                        <svg className="w-4 h-4 mr-2 animate-spin" viewBox="0 0 24 24" fill="none">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
                        </svg>
                        Eliminando…
                      </>
                    ) : (
                      <>
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                        Eliminar
                      </>
                    )}
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

export default ServiceCard;
