import { useState, useRef, useEffect } from 'react';

const MaterialCardNeeded = ({ material, onUpdate, onRemove, onOpenModal }) => {
  const [dropdownAbierto, setDropdownAbierto] = useState(false);
  const dropdownRef = useRef(null);
  const [units, setUnits] = useState(material.units || 1);
  const [waste, setWaste] = useState(material.waste || 0);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownAbierto(false);
      }
    };

    if (dropdownAbierto) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [dropdownAbierto]);

  const toggleDropdown = (e) => {
    e.stopPropagation(); 
    e.preventDefault(); 
    setDropdownAbierto(!dropdownAbierto);
  };

  const handleMoreInfo = (e) => {
    e.stopPropagation();  
    onOpenModal(material);
    setDropdownAbierto(false);
  };

  const handleRemove = (e) => {
    e.stopPropagation(); 
    onRemove(material.id);
    setDropdownAbierto(false);
  };

  const handleUnitsChange = (value) => {
    const newUnits = Math.max(1, value);
    setUnits(newUnits);
    onUpdate(material.id, newUnits, waste);
  };

  const handleWasteChange = (value) => {
    const newWaste = Math.max(0, value);
    setWaste(newWaste);
    onUpdate(material.id, units, newWaste);
  };

  const cost = material.costo * units * (1 + waste/100);

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3">
      <div className="flex items-start space-x-3">
        <img 
          src={material.imagen} 
          alt={material.nombre}
          className="w-12 h-12 object-cover rounded-md flex-shrink-0"
        />
        <div className="flex-1 min-w-0">
          <div className="flex justify-between items-start">
            <div>
              <h4 className="font-medium text-sm">{material.nombre}</h4>
              <p className="text-xs text-gray-500">${material.costo.toFixed(2)} c/u</p>
            </div>
            
            <div className="relative" ref={dropdownRef}>
              <button 
                onClick={toggleDropdown}
                className="text-gray-500 hover:text-gray-700 p-1 rounded hover:bg-gray-100"
                onMouseDown={(e) => e.stopPropagation()} 
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                </svg>
              </button>
              
              {dropdownAbierto && (
                <div 
                  className="absolute right-0 z-50 w-32 mt-1 origin-top-right bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none"
                  onClick={(e) => e.stopPropagation()} 
                  onMouseDown={(e) => e.stopPropagation()}
                >
                  <div className="py-1">
                    <button
                      onClick={handleMoreInfo}
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                    >
                      <div className="flex items-center">
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Más info
                      </div>
                    </button>
                    <button
                      onClick={handleRemove}
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
          
          <div className="grid grid-cols-2 gap-2 mt-2">
            <div>
              <label className="text-xs text-gray-600 block mb-1">Unidades</label>
              <input
                type="number"
                min="1"
                value={units}
                onChange={(e) => handleUnitsChange(parseInt(e.target.value) || 1)}
                className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
              />
            </div>
            <div>
              <label className="text-xs text-gray-600 block mb-1">Desperdicio (%)</label>
              <input
                type="number"
                min="0"
                value={waste}
                onChange={(e) => handleWasteChange(parseInt(e.target.value) || 0)}
                className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
              />
            </div>
          </div>
          
          <div className="flex justify-between items-center mt-2">
            <span className="inline-block px-2 py-1 bg-yellow-100 text-green-800 text-xs font-medium rounded-full capitalize">
              {material.tipo}
            </span>
            <div className="text-xs font-medium">
              Costo: ${cost.toFixed(2)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MaterialCardNeeded;