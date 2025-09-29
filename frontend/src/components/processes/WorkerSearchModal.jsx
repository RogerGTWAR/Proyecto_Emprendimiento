import { useState, useEffect, useRef, useMemo } from 'react';
import CloseButton from '../ui/CloseButton';
import Button from '../ui/Button';

const getNombre = (w = {}) =>
  w.nombre ?? w.name ?? w.firstname ?? w.first_name ?? w?.workers?.firstname ?? '';

const getApellido = (w = {}) =>
  w.apellido ?? w.lastname ?? w.last_name ?? w?.workers?.lastname ?? '';

const toUI = (w = {}) => ({
  ...w,
  id: w.id ?? w.worker_id ?? w?.workers?.id ?? w?.Workers?.id ?? w?.user_id ?? null,
  nombre: getNombre(w),
  apellido: getApellido(w),
});

const WorkerSearchModal = ({ isOpen, onClose, workers, onSelectWorkers }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedWorkers, setSelectedWorkers] = useState([]);
  const [filteredWorkers, setFilteredWorkers] = useState([]);
  const inputRef = useRef(null);

  // Normaliza SIEMPRE la lista que entra por props
  const normalizedWorkers = useMemo(
    () => (Array.isArray(workers) ? workers.map(toUI) : []),
    [workers]
  );

  // Filtro de búsqueda usando solo nombre y apellido
  useEffect(() => {
    if (!normalizedWorkers.length) {
      setFilteredWorkers([]);
      return;
    }

    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      const filtered = normalizedWorkers.filter((w) => {
        const nombreCompleto = `${w.nombre || ''} ${w.apellido || ''}`.toLowerCase();
        return nombreCompleto.includes(q);
      });
      setFilteredWorkers(filtered);
    } else {
      setFilteredWorkers(normalizedWorkers);
    }
  }, [searchTerm, normalizedWorkers]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  const toggleWorkerSelection = (worker) => {
    if (!worker) return;
    setSelectedWorkers((prev) => {
      const isSelected = prev.find((w) => w && w.id === worker.id);
      return isSelected ? prev.filter((w) => w && w.id !== worker.id) : [...prev, worker];
    });
  };

  const handleAddWorkers = (e) => {
    e?.preventDefault();
    e?.stopPropagation();
    onSelectWorkers(selectedWorkers);
    setSelectedWorkers([]);
    setSearchTerm('');
    onClose();
  };

  const handleSearchChange = (e) => setSearchTerm(e.target.value);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      e.stopPropagation();
      return false;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-60 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[80vh] overflow-y-auto">
        <div className="flex items-center justify-between p-4 border-b border-[#D1D5DB]">
          <h2 className="text-xl font-semibold text-[#1E1E1E]">Buscar Trabajadores</h2>
          <CloseButton onClick={onClose} />
        </div>

        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Buscar trabajador</label>
            <input
              ref={inputRef}
              type="text"
              value={searchTerm}
              onChange={handleSearchChange}
              onKeyDown={handleKeyDown}
              placeholder="Nombre o apellido..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#209E7F] focus:border-transparent"
            />
          </div>

          <div className="max-h-64 overflow-y-auto border border-gray-200 rounded-lg">
            {filteredWorkers.length > 0 ? (
              filteredWorkers.map((worker) => {
                const initials = `${(worker.nombre || '').charAt(0)}${(worker.apellido || '').charAt(0)}`.toUpperCase();
                const checked = !!selectedWorkers.find((w) => w && w.id === worker.id);

                return (
                  <div
                    key={worker.id}
                    className={`flex items-center justify-between p-3 border-b border-gray-100 last:border-b-0 cursor-pointer hover:bg-gray-50 ${
                      checked ? 'bg-blue-50' : ''
                    }`}
                    onClick={() => toggleWorkerSelection(worker)}
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-[#209E7F] hover:bg-[#32C3A2] rounded-full flex items-center justify-center">
                        <span className="text-white font-semibold text-xs">{initials}</span>
                      </div>
                      <div>
                        <p className="font-medium text-gray-700">
                          {worker.nombre} {worker.apellido}
                        </p>
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggleWorkerSelection(worker)}
                      className="h-4 w-4 text-[#209E7F] focus:ring-[#209E7F] border-gray-300 rounded"
                      onClick={(e) => e.stopPropagation()}
                    />
                  </div>
                );
              })
            ) : (
              <div className="p-4 text-center text-gray-500">
                {searchTerm ? 'No se encontraron trabajadores' : 'Ingresa un término de búsqueda'}
              </div>
            )}
          </div>

          <div className="bg-gray-50 p-3 rounded-lg">
            <p className="text-sm text-gray-600">
              {selectedWorkers.length > 0
                ? `${selectedWorkers.length} trabajador(es) seleccionado(s)`
                : 'Selecciona uno o más trabajadores'}
            </p>
          </div>

          <div className="flex space-x-3 pt-4">
            <Button type="button" variant="secondary" onClick={onClose} className="flex-1">
              Cancelar
            </Button>
            <Button
              type="button"
              variant="primary"
              onClick={handleAddWorkers}
              className="flex-1"
              disabled={selectedWorkers.length === 0}
            >
              Agregar
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WorkerSearchModal;
