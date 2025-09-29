import { useState, useMemo } from 'react';
import Button from '../ui/Button';
import ProcessDetails from './ProcessDetails';

const num = (v, d = 0) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : d;
};

const money = (v) =>
  new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' })
    .format(num(v, 0));

const ProcessCard = ({ process, onEdit, onDelete }) => {
  const [showDetails, setShowDetails] = useState(false);

  const data = useMemo(() => {
    const nombre = process.nombre ?? process.name ?? 'Proceso';
    const cantidad = num(process.cantidad ?? process.quantity, 1);
    const duracionTotal =
      num(process.duracionTotal ?? process.duracion_total_minutos ?? process.duration_total_minutes, 0);

    const costoTotal =
      num(process.costoTotal ?? process.costo_total ?? process.cost_total, 0);

    const trabajadoresCount = Array.isArray(process.trabajadores)
      ? process.trabajadores.length
      : Array.isArray(process.process_worker)
      ? process.process_worker.length
      : 0;

    const serviciosCount = Array.isArray(process.servicios)
      ? process.servicios.length
      : Array.isArray(process.process_service)
      ? process.process_service.length
      : 0;

    return { nombre, cantidad, duracionTotal, costoTotal, trabajadoresCount, serviciosCount };
  }, [process]);

  return (
    <>
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow w-full max-w-xs mx-auto">
        <div className="flex justify-between items-start mb-4 gap-3">
          <div className="min-w-0 flex-1">
            <h3 className="text-xl font-semibold text-gray-800 mb-2 line-clamp-2 break-words">
              {data.nombre}
            </h3>
            <div className="flex flex-wrap items-center gap-2 text-sm text-gray-600">
              <span className="whitespace-nowrap">Cantidad: {data.cantidad}</span>
              <span className="whitespace-nowrap">Duración: {data.duracionTotal} min</span>
            </div>
          </div>
          <span className="text-2xl font-bold text-gray-800 whitespace-nowrap shrink-0">
            {money(data.costoTotal)}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
          <div className="truncate">
            <span className="text-gray-600">Trabajadores:</span>
            <span className="ml-2 font-medium">{data.trabajadoresCount}</span>
          </div>
          <div className="truncate">
            <span className="text-gray-600">Servicios:</span>
            <span className="ml-2 font-medium">{data.serviciosCount}</span>
          </div>
        </div>

        <div className="flex space-x-3">
          <Button
            variant="primary"
            onClick={() => setShowDetails(true)}
            className="flex-1 min-w-0"
          >
            Más información
          </Button>
        </div>
      </div>

      {showDetails && (
        <ProcessDetails
          process={process}
          onClose={() => setShowDetails(false)}
          onEdit={() => onEdit(process)}
          onDelete={() => onDelete(process.id)}
        />
      )}
    </>
  );
};

export default ProcessCard;
