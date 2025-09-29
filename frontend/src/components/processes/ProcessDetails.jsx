import { useMemo, useState } from 'react';
import CloseButton from '../ui/CloseButton';
import ButtonIcon from '../ui/ButtonIcon';
import DeleteConfirmationModal from '../ui/DeleteConfirmationModal';

const num = (v, d = 0) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : d;
};
const money = (v) =>
  new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' })
    .format(num(v, 0));

const fullName = (w) => {
  const byField = w?.name ?? w?.nombre;
  if (byField) return String(byField);

  const fn = w?.firstname ?? w?.first_name ?? w?.nombre ?? '';
  const ln = w?.lastname ?? w?.last_name ?? w?.apellido ?? '';
  return `${fn} ${ln}`.trim() || 'Trabajador';
};

const ServiceRow = (s) => {
  const nombre = s?.name ?? s?.nombre ?? s?.services?.name ?? 'Servicio';
  const cost = num(
    s?.cost_service ?? s?.monto ?? s?.cost ?? s?.services?.cost,
    0
  );
  return { nombre, cost };
};

const ProcessDetails = ({ process, onClose, onEdit, onDelete }) => {
  const [showDeleteModal, setIsDeleting] = useState(false);

  const data = useMemo(() => {
    const nombre = process.nombre ?? process.name ?? 'Proceso';
    const cantidad = num(process.cantidad ?? process.quantity, 1);
    const duracionTotal =
      num(process.duracionTotal ?? process.duracion_total_minutos ?? process.duration_total_minutes, 0);

    const costoTotal =
      num(process.costoTotal ?? process.costo_total ?? process.cost_total, 0);

    const producto =
      process.producto ??
      process.product ??
      (process.products ? {
        nombre: process.products.name,
        estimated_time: process.products.estimated_time,
        precio: process.products.price,
        description: process.products.description
      } : null);

    const servicios = (process.servicios ?? process.process_service ?? []).map(ServiceRow);
    const trabajadores = (process.trabajadores ?? process.process_worker ?? []).map((w) => {
      const costLabor = num(w?.cost_labor ?? w?.costo_mano_obra, NaN);
      const hourly =
        num(w?.pagoPorHora ?? w?.hourly_fee ?? w?.pago, NaN);
      return {
        display: fullName(w),
        cost_labor: Number.isFinite(costLabor) ? costLabor : (Number.isFinite(hourly) ? hourly : 0),
        hourly: Number.isFinite(hourly) ? hourly : null,
        raw: w
      };
    });

    return { nombre, cantidad, duracionTotal, costoTotal, producto, servicios, trabajadores };
  }, [process]);

  const breakdown = useMemo(() => {
    const horas = data.duracionTotal > 0 ? data.duracionTotal / 60 : 0;

    const materiales =
      num(data.producto?.totalCost ?? data.producto?.total_cost, NaN);
    const precioUnit = num(data.producto?.precio ?? data.producto?.price, NaN);
    const costoMateriales = Number.isFinite(materiales)
      ? materiales
      : (Number.isFinite(precioUnit) ? precioUnit * data.cantidad : 0);

    const manoObra = data.trabajadores.reduce((acc, w) => {
      if (w.hourly != null) {
        return acc + w.hourly * horas;
      }
      return acc + num(w.cost_labor, 0);
    }, 0);

    const serviciosTotal = data.servicios.reduce((acc, s) => acc + num(s.cost, 0), 0);

    const total = num(
      data.costoTotal,
      costoMateriales + manoObra + serviciosTotal
    );

    return {
      materiales: costoMateriales,
      manoObra,
      servicios: serviciosTotal,
      total
    };
  }, [data]);

  const EditIcon = () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
    </svg>
  );

  const DeleteIcon = () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
    </svg>
  );

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
          <div className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-2xl font-bold text-gray-800">Detalles del Proceso</h1>
              <CloseButton onClick={onClose} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="bg-white rounded-lg p-4 border border-gray-200">
                  <h3 className="font-semibold text-gray-800 text-lg mb-3">{data.nombre}</h3>

                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <h4 className="text-sm font-medium text-gray-600 mb-1">Cantidad</h4>
                      <p className="text-lg font-bold text-gray-800">{data.cantidad}</p>
                    </div>

                    <div className="bg-gray-50 p-3 rounded-lg">
                      <h4 className="text-sm font-medium text-gray-600 mb-1">Duración Total</h4>
                      <p className="text-lg font-bold text-gray-800">{data.duracionTotal} min</p>
                    </div>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="text-sm font-medium text-gray-600 mb-1">Costo Total Estimado</h4>
                    <p className="text-2xl font-bold text-gray-900">
                      {money(data.costoTotal ?? breakdown.total)}
                    </p>
                  </div>
                </div>

                {data.producto && (
                  <div className="bg-white rounded-lg p-4 border border-gray-200">
                    <h3 className="text-sm font-medium text-gray-600 mb-2">Producto</h3>
                    <div className="space-y-2">
                      <p>Nombre: {data.producto.nombre ?? data.producto.name}</p>
                      <p>Tiempo unitario: {num(data.producto.estimated_time, 0)} min</p>
                      {(data.producto.precio ?? data.producto.price) && (
                        <p>
                          <strong>Precio unitario:</strong> {money(data.producto.precio ?? data.producto.price)}
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-4">
                <div className="bg-white rounded-lg p-4 border border-gray-200">
                  <h3 className="text-sm font-medium text-gray-600 mb-3">Desglose de Costos</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Materiales/Producto:</span>
                      <span>{money(breakdown.materiales)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Mano de obra:</span>
                      <span>{money(breakdown.manoObra)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Servicios:</span>
                      <span>{money(breakdown.servicios)}</span>
                    </div>
                    <div className="border-t pt-2 mt-2 font-semibold flex justify-between">
                      <span>Total:</span>
                      <span>{money(breakdown.total)}</span>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg p-4 border border-gray-200">
                  <h3 className="text-sm font-medium text-gray-600 mb-3">
                    Trabajadores ({(process.trabajadores ?? process.process_worker ?? []).length})
                  </h3>
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {(process.trabajadores ?? process.process_worker ?? []).map((w, idx) => {
                      const name = fullName(w);
                      const initials = name.split(' ').map(s => s[0]).slice(0,2).join('').toUpperCase();
                      const dept = w?.departamento ?? w?.department ?? '';
                      return (
                        <div key={idx} className="flex items-center space-x-2 p-2 bg-gray-50 rounded">
                          <div className="w-8 h-8 bg-[#209E7F] rounded-full flex items-center justify-center">
                            <span className="text-white font-semibold text-xs">{initials || 'M'}</span>
                          </div>
                          <div>
                            <p className="text-sm font-medium">{name}</p>
                            {!!dept && <p className="text-xs text-gray-500">{dept}</p>}
                          </div>
                        </div>
                      );
                    })}
                    {(!(process.trabajadores ?? process.process_worker)?.length) && (
                      <p className="text-gray-500 text-sm text-center py-2">No hay trabajadores</p>
                    )}
                  </div>
                </div>

                <div className="bg-white rounded-lg p-4 border border-gray-200">
                  <h3 className="text-sm font-medium text-gray-600 mb-3">
                    Servicios ({(process.servicios ?? process.process_service ?? []).length})
                  </h3>
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {(process.servicios ?? process.process_service ?? []).map((s, idx) => {
                      const { nombre, cost } = ServiceRow(s);
                      const desc = s?.descripcion ?? s?.description ?? '';
                      return (
                        <div key={idx} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                          <div>
                            <p className="text-sm font-medium">{nombre}</p>
                            {!!desc && <p className="text-xs text-gray-500">{desc}</p>}
                          </div>
                          <span className="text-sm font-semibold">{money(cost)}</span>
                        </div>
                      );
                    })}
                    {(!(process.servicios ?? process.process_service)?.length) && (
                      <p className="text-gray-500 text-sm text-center py-2">No hay servicios</p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-6 mt-6">
              <ButtonIcon
                variant="primary"
                onClick={() => { onEdit(process); onClose(); }}
                icon={<EditIcon />}
                iconPosition="left"
                className="flex-1"
              >
                Editar Proceso
              </ButtonIcon>

              <ButtonIcon
                variant="secondary"
                onClick={() => setIsDeleting(true)}
                icon={<DeleteIcon />}
                iconPosition="left"
                className="flex-1"
              >
                Eliminar
              </ButtonIcon>
            </div>
          </div>
        </div>
      </div>

      <DeleteConfirmationModal
        isOpen={showDeleteModal}
        onClose={() => setIsDeleting(false)}
        onConfirm={() => { onDelete(); setIsDeleting(false); onClose(); }}
        itemName={data.nombre}
        loading={false}
      />
    </>
  );
};

export default ProcessDetails;
