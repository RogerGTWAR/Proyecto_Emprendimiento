import { useState, useEffect, useRef } from 'react';
import Button from '../ui/Button';
import CloseButton from "../ui/CloseButton";
import WorkerSearchModal from './WorkerSearchModal';
import ServiceForm from './ServiceForm';
import WorkerCard from './WorkerCard';
import ServiceCard from './ServiceCard';
import { productsPrueba } from '../../data/productsData';
import { trabajadoresPrueba } from '../../data/workersData';

const ProcessForm = ({ onClose, onSubmit, initialData, isEdit = false }) => {
  const [formData, setFormData] = useState({
    producto: null,
    cantidad: 1,
    trabajadores: [],
    servicios: [],
    duracionTotal: 0
  });

  const [searchProduct, setSearchProduct] = useState('');
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [showProductResults, setShowProductResults] = useState(false);
  const [showWorkerModal, setShowWorkerModal] = useState(false);
  const [showServiceForm, setShowServiceForm] = useState(false);
  const [editingService, setEditingService] = useState(null);

  const searchInputRef = useRef(null);

  useEffect(() => {
    if (isEdit && initialData) {
      setFormData({
        producto: initialData.producto || null,
        cantidad: initialData.cantidad || 1,
        trabajadores: initialData.trabajadores || [],
        servicios: initialData.servicios || [],
        duracionTotal: initialData.duracionTotal || 0
      });
      
      if (initialData.producto) {
        setSearchProduct(initialData.producto.nombre || '');
      }
    }
  }, [isEdit, initialData]);

  useEffect(() => {
    if (searchProduct) {
      const filtered = productsPrueba.filter(product =>
        product.nombre.toLowerCase().includes(searchProduct.toLowerCase())
      );
      setFilteredProducts(filtered);
      setShowProductResults(true);
    } else {
      setFilteredProducts([]);
      setShowProductResults(false);
    }
  }, [searchProduct]);

  useEffect(() => {
    if (formData.producto && formData.cantidad > 0) {
      const duracionTotal = formData.producto.estimated_time * formData.cantidad;
      setFormData(prev => ({
        ...prev,
        duracionTotal: duracionTotal
      }));
    }
  }, [formData.producto, formData.cantidad]);

  const calculateTotalCost = () => {
    let costoTotal = 0;

    if (formData.producto && formData.producto.precio) {
      costoTotal += formData.producto.precio * formData.cantidad;
    }

    if (formData.trabajadores.length > 0 && formData.duracionTotal > 0) {
      const duracionEnHoras = formData.duracionTotal / 60; // Convertir minutos a horas
      
      formData.trabajadores.forEach(worker => {
        const pagoPorHora = worker.pago || 0;
        costoTotal += pagoPorHora * duracionEnHoras;
      });
    }

    if (formData.servicios.length > 0) {
      formData.servicios.forEach(service => {
        costoTotal += service.monto || 0;
      });
    }

    return costoTotal;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleProductSelect = (product) => {
    setFormData({
      ...formData,
      producto: product
    });
    setSearchProduct(product.nombre);
    setShowProductResults(false);
  };

  const handleProductSearch = (e) => {
    setSearchProduct(e.target.value);
  };

  const handleAddWorkers = (workers) => {
    const existingIds = formData.trabajadores.map(w => w.id);
    const newWorkers = workers.filter(worker => !existingIds.includes(worker.id));
    
    setFormData({
      ...formData,
      trabajadores: [...formData.trabajadores, ...newWorkers]
    });
    setShowWorkerModal(false);
  };

  const handleRemoveWorker = (workerId) => {
    setFormData({
      ...formData,
      trabajadores: formData.trabajadores.filter(w => w.id !== workerId)
    });
  };

  const handleAddService = (service) => {
    if (editingService) {
      setFormData({
        ...formData,
        servicios: formData.servicios.map(s => 
          s.id === editingService.id ? service : s
        )
      });
      setEditingService(null);
    } else {
      setFormData({
        ...formData,
        servicios: [...formData.servicios, { ...service, id: Date.now() }]
      });
    }
    setShowServiceForm(false);
  };

  const handleEditService = (service) => {
    setEditingService(service);
    setShowServiceForm(true);
  };

  const handleRemoveService = (serviceId) => {
    setFormData({
      ...formData,
      servicios: formData.servicios.filter(s => s.id !== serviceId)
    });
  };

  const handleSubmit = () => {
    if (!formData.producto) {
      alert('Por favor selecciona un producto');
      return;
    }
    
    const processData = {
      ...formData,
      nombre: formData.producto.nombre,
      costoTotal: calculateTotalCost(),
      id: isEdit ? initialData.id : Date.now()
    };
    onSubmit(processData);
  };

  const handleAddWorkersClick = (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    setShowWorkerModal(true);
  };

  const handleAddServicesClick = (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    setShowServiceForm(true);
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchInputRef.current && !searchInputRef.current.contains(e.target)) {
        setShowProductResults(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const formatearMoneda = (monto) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN'
    }).format(monto);
  };

  const desgloseCosto = () => {
    const desglose = {
      materiales: 0,
      manoObra: 0,
      servicios: 0,
      total: 0
    };

    if (formData.producto && formData.producto.precio) {
      desglose.materiales = formData.producto.precio * formData.cantidad;
    }

    if (formData.trabajadores.length > 0 && formData.duracionTotal > 0) {
      const duracionEnHoras = formData.duracionTotal / 60;
      formData.trabajadores.forEach(worker => {
        const pagoPorHora = worker.pago || 0;
        desglose.manoObra += pagoPorHora * duracionEnHoras;
      });
    }

    formData.servicios.forEach(service => {
      desglose.servicios += service.monto || 0;
    });

    desglose.total = desglose.materiales + desglose.manoObra + desglose.servicios;
    
    return desglose;
  };

  const costoDesglosado = desgloseCosto();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        
        <div className="flex items-center justify-between p-4 border-b border-[#D1D5DB]">
          <h2 className="text-xl font-semibold text-[#1E1E1E]">
            {isEdit ? 'Editar Proceso' : 'Agregar Proceso de Producción'}
          </h2>
          <CloseButton onClick={onClose} />
        </div>

        <div className="p-6 space-y-6">
          
          <div ref={searchInputRef} className="relative">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Producto a Producir *
            </label>
            <input
              type="text"
              value={searchProduct}
              onChange={handleProductSearch}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  e.stopPropagation();
                }
              }}
              placeholder="Buscar producto..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#209E7F] focus:border-transparent"
            />
            
            {showProductResults && (
              <div 
                className="absolute z-20 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
              >
                {filteredProducts.map(product => (
                  <div
                    key={product.id}
                    className="p-3 border-b border-gray-100 last:border-b-0 cursor-pointer hover:bg-gray-50"
                    onClick={() => handleProductSelect(product)}
                  >
                    <div className="font-medium">{product.nombre}</div>
                    <div className="text-sm text-gray-500">
                      Tiempo unitario: {product.estimated_time} min
                      {product.precio && ` | Precio: ${formatearMoneda(product.precio)}`}
                    </div>
                  </div>
                ))}
                {filteredProducts.length === 0 && (
                  <div className="p-3 text-gray-500">No se encontraron productos</div>
                )}
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Cantidad *
              </label>
              <input
                type="number"
                name="cantidad"
                min="1"
                value={formData.cantidad}
                onChange={handleChange}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') e.preventDefault();
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#209E7F] focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Duración Total (min)
              </label>
              <input
                type="number"
                name="duracionTotal"
                value={formData.duracionTotal}
                readOnly
                className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-600"
              />
              <p className="text-xs text-gray-500 mt-1">
                {formData.producto ? 
                  `Cálculo: ${formData.cantidad} × ${formData.producto.estimated_time} min = ${formData.duracionTotal} min` : 
                  'Selecciona un producto para calcular la duración'}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="block text-sm font-medium text-gray-700">
                  Trabajadores Asignados
                </label>
                <span className="text-sm text-gray-500">
                  {formData.trabajadores.length} seleccionados
                </span>
              </div>
              
              <div className="flex justify-end">
                <Button
                  type="button"
                  variant="gray"
                  onClick={handleAddWorkersClick}
                  className="px-6 py-2.5"
                >
                  Trabajadores
                </Button>
              </div>

              <div className="space-y-2 max-h-64 overflow-y-auto min-h-[120px]">
                {formData.trabajadores.map(worker => (
                  <WorkerCard
                    key={worker.id}
                    worker={worker}
                    onRemove={handleRemoveWorker}
                  />
                ))}
                {formData.trabajadores.length === 0 && (
                  <div className="text-center py-4 text-gray-500 text-sm">
                    No hay trabajadores agregados
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="block text-sm font-medium text-gray-700">
                  Servicios Adicionales
                </label>
                <span className="text-sm text-gray-500">
                  {formData.servicios.length} agregados
                </span>
              </div>
              
              <div className="flex justify-end">
                <Button
                  type="button"
                  variant="gray"
                  onClick={handleAddServicesClick}
                  className="px-6 py-2.5"
                >
                Servicios
                </Button>
              </div>

              <div className="space-y-2 max-h-64 overflow-y-auto min-h-[120px]">
                {formData.servicios.map(service => (
                  <ServiceCard
                    key={service.id}
                    service={service}
                    onRemove={handleRemoveService}
                    onEdit={handleEditService}
                  />
                ))}
                {formData.servicios.length === 0 && (
                  <div className="text-center py-4 text-gray-500 text-sm">
                    No hay servicios agregados
                  </div>
                )}
              </div>
            </div>
          </div>

          {formData.producto && (
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="font-semibold text-blue-900 mb-2">Producto Seleccionado:</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium">Nombre:</span> {formData.producto.nombre}
                </div>
                <div>
                  <span className="font-medium">Tiempo unitario:</span> {formData.producto.estimated_time} min
                </div>
                {formData.producto.precio && (
                  <div>
                    <span className="font-medium">Precio unitario:</span> {formatearMoneda(formData.producto.precio)}
                  </div>
                )}
                <div className="col-span-2">
                  <span className="font-medium">Descripción:</span> {formData.producto.description}
                </div>
              </div>
            </div>
          )}

          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-lg font-semibold mb-3">Desglose del Costo Estimado</h3>
            
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Costo de materiales:</span>
                <span>{formatearMoneda(costoDesglosado.materiales)}</span>
              </div>
              
              <div className="flex justify-between">
                <span>Costo de mano de obra:</span>
                <span>{formatearMoneda(costoDesglosado.manoObra)}</span>
              </div>
              
              <div className="flex justify-between">
                <span>Servicios adicionales:</span>
                <span>{formatearMoneda(costoDesglosado.servicios)}</span>
              </div>
              
              <div className="border-t border-gray-300 pt-2 mt-2">
                <div className="flex justify-between font-semibold text-lg">
                  <span>Costo Total Estimado:</span>
                  <span className="text-gray-600">{formatearMoneda(costoDesglosado.total)}</span>
                </div>
              </div>
            </div>
            
            <p className="text-xs text-gray-600 mt-3">
              {formData.trabajadores.length > 0 && formData.duracionTotal > 0 ? 
                `Cálculo mano de obra: ${formData.trabajadores.length} trabajador(es) × ${formData.duracionTotal} min (${(formData.duracionTotal/60).toFixed(1)} horas)` : 
                'Agrega trabajadores y duración para calcular costo de mano de obra'}
            </p>
          </div>

          <div className="flex space-x-3 pt-4">
            <Button type="button" variant="secondary" onClick={onClose} className="flex-1 py-2.5">
              Cancelar
            </Button>
            <Button 
              type="button"
              variant="primary" 
              onClick={handleSubmit}
              className="flex-1 py-2.5"
              disabled={!formData.producto}
            >
              {isEdit ? 'Guardar Cambios' : 'Agregar Proceso'}
            </Button>
          </div>
        </div>
      </div>

      {showWorkerModal && (
        <WorkerSearchModal
          isOpen={showWorkerModal}
          onClose={() => setShowWorkerModal(false)}
          workers={trabajadoresPrueba}
          onSelectWorkers={handleAddWorkers}
        />
      )}

      {showServiceForm && (
        <ServiceForm
          isOpen={showServiceForm}
          onClose={() => {
            setShowServiceForm(false);
            setEditingService(null);
          }}
          onSubmit={handleAddService}
          initialData={editingService}
          isEdit={!!editingService}
        />
      )}
    </div>
  );
};

export default ProcessForm;