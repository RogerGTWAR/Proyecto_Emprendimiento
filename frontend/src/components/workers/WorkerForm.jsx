import { useState, useEffect } from 'react';
import Button from '../ui/Button';
import Input from '../ui/Input';
import CloseButton from "../ui/CloseButton";

const WorkerForm = ({ onClose, onSubmit, initialData, isEdit = false }) => {
  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    departamento: '',
    pago: ''
  });

  const [focusedField, setFocusedField] = useState(null);

  useEffect(() => {
    if (initialData) {
      setFormData({
        nombre: initialData.nombre || '',
        apellido: initialData.apellido || '',
        departamento: initialData.departamento || '',
        pago: initialData.pago || ''
      });
    }
  }, [initialData]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleFocus = (fieldName) => {
    setFocusedField(fieldName);
  };

  const handleBlur = () => {
    setFocusedField(null);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">

        <div className="flex items-center justify-between p-4 border-b border-[#D1D5DB]">
          <h2 className="text-xl font-semibold text-[#1E1E1E]">
            {isEdit ? 'Editar Trabajador' : 'Agregar Trabajador'}
          </h2>
          <CloseButton onClick={onClose} />
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div className="grid grid-cols-1 gap-4">
            <Input
              label="Nombre"
              name="nombre"
              type="text"
              required
              value={formData.nombre}
              onChange={handleChange}
              onFocus={() => handleFocus('nombre')}
              onBlur={handleBlur}
              placeholder="Ej: Juan"
              className="text-base"
            />

            <Input
              label="Apellido"
              name="apellido"
              type="text"
              required
              value={formData.apellido}
              onChange={handleChange}
              onFocus={() => handleFocus('apellido')}
              onBlur={handleBlur}
              placeholder="Ej: Pérez"
              className="text-base"
            />
          </div>

          <div className="space-y-1">
            <label className="block text-sm font-medium text-[#1E1E1E]">
              Departamento
            </label>
            <select
              name="departamento"
              value={formData.departamento}
              onChange={handleChange}
              onFocus={() => handleFocus('departamento')}
              onBlur={handleBlur}
              className="w-full px-3 py-2.5 border border-[#D1D5DB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#209E7F] focus:border-transparent transition-colors duration-200 text-[#4B5563]"
              required
            >
              <option value="">Seleccionar departamento</option>
              <option value="produccion">Producción</option>
              <option value="ventas">Ventas</option>
              <option value="administracion">Administración</option>
            </select>
          </div>

          <Input
            label="Salario por hora ($)"
            name="pago"
            type="number"
            step="0.01"
            required
            value={formData.pago}
            onChange={handleChange}
            onFocus={() => handleFocus('pago')}
            onBlur={handleBlur}
            placeholder="0.00"
            min="0"
            className="text-base"
          />

          <div className="flex space-x-3 pt-4">
            <Button 
              type="button" 
              variant="secondary" 
              onClick={onClose} 
              className="flex-1 py-2.5"
            >
              Cancelar
            </Button>
            <Button 
              type="submit" 
              variant="primary" 
              className="flex-1 py-2.5"
            >
              {isEdit ? 'Guardar Cambios' : 'Agregar Trabajador'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default WorkerForm;