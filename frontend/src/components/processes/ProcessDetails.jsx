import { useState } from 'react';
import CloseButton from '../ui/CloseButton';
import ButtonIcon from '../ui/ButtonIcon';
import DeleteConfirmationModal from '../ui/DeleteConfirmationModal';

const ProcessDetails = ({ process, onClose, onEdit, onDelete }) => {
  const [showDeleteModal, setIsDeleting] = useState(false);

  const formatearMoneda = (monto) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN'
    }).format(monto);
  };

  const calcularCostoTrabajadores = () => {
    if (!process.trabajadores || process.trabajadores.length === 0) return 0;
    
    const duracionEnHoras = process.duracionTotal / 60;
    return process.trabajadores.reduce((total, worker) => {
      return total + ((worker.pago || 0) * duracionEnHoras);
    }, 0);
  };

  const calcularCostoServicios = () => {
    if (!process.servicios || process.servicios.length === 0) return 0;
    
    return process.servicios.reduce((total, service) => {
      return total + (service.monto || 0);
    }, 0);
  };

  const handleEditClick = () => {
    onEdit(process); 
    onClose();  
  };

  const handleDeleteClick = () => {
    setIsDeleting(true);
  };

  const handleConfirmDelete = () => {
    onDelete();
    setIsDeleting(false);
    onClose();
  };

  const handleCancelDelete = () => {
    setIsDeleting(false);
  };

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
                  <h3 className="font-semibold text-gray-800 text-lg mb-3">{process.nombre}</h3>
                  
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <h4 className="text-sm font-medium text-gray-600 mb-1">Cantidad</h4>
                      <p className="text-lg font-bold text-gray-800">{process.cantidad}</p>
                    </div>
                    
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <h4 className="text-sm font-medium text-gray-600 mb-1">Duración Total</h4>
                      <p className="text-lg font-bold text-gray-800">{process.duracionTotal} min</p>
                    </div>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="text-sm font-medium text-gray-600 mb-1">Costo Total Estimado</h4>
                    <p className="text-2xl font-bold text-gray-900">
                      {formatearMoneda(process.costoTotal)}
                    </p>
                  </div>
                </div>

                {process.producto && (
                  <div className="bg-white rounded-lg p-4 border border-gray-200">
                    <h3 className="text-sm font-medium text-gray-600 mb-2">Producto</h3>
                    <div className="space-y-2">
                      <p>Nombre: {process.producto.nombre}</p>
                      <p>Tiempo unitario: {process.producto.estimated_time} min</p>
                      {process.producto.precio && (
                        <p><strong>Precio unitario:</strong> {formatearMoneda(process.producto.precio)}</p>
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
                      <span>{formatearMoneda(process.producto?.precio ? process.producto.precio * process.cantidad : 0)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Mano de obra:</span>
                      <span>{formatearMoneda(calcularCostoTrabajadores())}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Servicios:</span>
                      <span>{formatearMoneda(calcularCostoServicios())}</span>
                    </div>
                    <div className="border-t pt-2 mt-2 font-semibold flex justify-between">
                      <span>Total:</span>
                      <span>{formatearMoneda(process.costoTotal)}</span>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg p-4 border border-gray-200">
                  <h3 className="text-sm font-medium text-gray-600 mb-3">
                    Trabajadores ({process.trabajadores?.length || 0})
                  </h3>
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {process.trabajadores?.map((worker, index) => (
                      <div key={index} className="flex items-center space-x-2 p-2 bg-gray-50 rounded">
                        <div className="w-8 h-8 bg-[#209E7F] rounded-full flex items-center justify-center">
                          <span className="text-white font-semibold text-xs">
                            {worker.nombre?.charAt(0)}{worker.apellido?.charAt(0)}
                          </span>
                        </div>
                        <div>
                          <p className="text-sm font-medium">{worker.nombre} {worker.apellido}</p>
                          <p className="text-xs text-gray-500">{worker.departamento}</p>
                        </div>
                      </div>
                    ))}
                    {(!process.trabajadores || process.trabajadores.length === 0) && (
                      <p className="text-gray-500 text-sm text-center py-2">No hay trabajadores</p>
                    )}
                  </div>
                </div>

                <div className="bg-white rounded-lg p-4 border border-gray-200">
                  <h3 className="text-sm font-medium text-gray-600 mb-3">
                    Servicios ({process.servicios?.length || 0})
                  </h3>
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {process.servicios?.map((service, index) => (
                      <div key={index} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                        <div>
                          <p className="text-sm font-medium">{service.nombre}</p>
                          <p className="text-xs text-gray-500">{service.descripcion}</p>
                        </div>
                        <span className="text-sm font-semibold">{formatearMoneda(service.monto)}</span>
                      </div>
                    ))}
                    {(!process.servicios || process.servicios.length === 0) && (
                      <p className="text-gray-500 text-sm text-center py-2">No hay servicios</p>
                    )}
                  </div>
                </div>
              </div>
            </div>

               <div className="flex flex-col sm:flex-row gap-3 pt-6 mt-6">
                <ButtonIcon
                  variant="primary"
                  onClick={handleEditClick}
                  icon={<EditIcon />}
                  iconPosition="left"
                  className="flex-1"
                >
                  Editar Proceso
                </ButtonIcon>
                
                <ButtonIcon
                  variant="secondary"
                  onClick={handleDeleteClick}
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
        onClose={handleCancelDelete}
        onConfirm={handleConfirmDelete}
        itemName={process.nombre}
        loading={false}
      />
    </>
  );
};

export default ProcessDetails;