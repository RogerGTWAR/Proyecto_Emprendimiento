import { useState } from 'react';
import Button from '../ui/Button';
import ProcessDetails from './ProcessDetails';

const ProcessCard = ({ process, onEdit, onDelete }) => {
  const [showDetails, setShowDetails] = useState(false);

  const handleViewDetails = () => {
    setShowDetails(true);
  };

  const handleCloseDetails = () => {
    setShowDetails(false);
  };

  const handleEdit = () => {
    onEdit(process);
  };

  const handleDelete = () => {
    onDelete(process.id);
  };

  const formatearMoneda = (monto) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN'
    }).format(monto);
  };

  return (
    <>
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow w-full max-w-xs mx-auto">
        <div className="flex justify-between items-start mb-4 gap-3">
          <div className="min-w-0 flex-1">
            <h3 className="text-xl font-semibold text-gray-800 mb-2 line-clamp-2 break-words">
              {process.nombre}
            </h3>
            <div className="flex flex-wrap items-center gap-2 text-sm text-gray-600">
              <span className="whitespace-nowrap">Cantidad: {process.cantidad}</span>
               
              <span className="whitespace-nowrap">Duración: {process.duracionTotal} min</span>
            </div>
          </div>
          <span className="text-2xl font-bold text-gray-800 whitespace-nowrap shrink-0">
            {formatearMoneda(process.costoTotal)}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
          <div className="truncate">
            <span className="text-gray-600">Trabajadores:</span>
            <span className="ml-2 font-medium">
              {process.trabajadores?.length || 0}
            </span>
          </div>
          <div className="truncate">
            <span className="text-gray-600">Servicios:</span>
            <span className="ml-2 font-medium">
              {process.servicios?.length || 0}
            </span>
          </div>
        </div>

        <div className="flex space-x-3">
          <Button
            variant="primary"
            onClick={handleViewDetails}
            className="flex-1 min-w-0"
          >
            Más información
          </Button>
        </div>
      </div>

      {showDetails && (
        <ProcessDetails
          process={process}
          onClose={handleCloseDetails}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      )}
    </>
  );
};

export default ProcessCard;