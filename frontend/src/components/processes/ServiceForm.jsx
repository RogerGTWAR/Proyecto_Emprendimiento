import { useState, useEffect } from 'react';
import CloseButton from '../ui/CloseButton';
import Button from '../ui/Button';

const ServiceForm = ({ isOpen, onClose, onSubmit, initialData, isEdit = false }) => {
  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
    monto: '' 
  });

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    } else {
      setFormData({
        nombre: '',
        descripcion: '',
        monto: ''
      });
    }
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value 
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    const montoNumerico = parseFloat(formData.monto) || 0;
    
    if (!formData.nombre.trim() || montoNumerico <= 0) {
      alert('Por favor completa todos los campos correctamente');
      return;
    }

    onSubmit({
      ...formData,
      monto: montoNumerico
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-60 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
        <div className="flex items-center justify-between p-4 border-b border-[#D1D5DB]">
          <h2 className="text-xl font-semibold text-[#1E1E1E]">
            {isEdit ? 'Editar Servicio' : 'Agregar Servicio'}
          </h2>
          <CloseButton onClick={onClose} />
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nombre del Servicio *
            </label>
            <input
              type="text"
              name="nombre"
              value={formData.nombre}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#209E7F] focus:border-transparent"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Monto ($) *
            </label>
            <input
              type="number"
              name="monto"
              min="0"
              step="0.01"
              value={formData.monto} 
              onChange={handleChange}
              placeholder="0.00"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#209E7F] focus:border-transparent"
              required
            />
          </div>

          <div className="flex space-x-3 pt-4">
            <Button 
              type="button" 
              variant="secondary" 
              onClick={onClose} 
              className="flex-1"
            >
              Cancelar
            </Button>
            <Button 
              type="submit"
              variant="primary" 
              className="flex-1"
            >
              {isEdit ? 'Guardar Cambios' : 'Agregar Servicio'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ServiceForm;