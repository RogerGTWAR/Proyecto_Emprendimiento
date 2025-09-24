import { useState, useEffect } from 'react';
import { api } from '../../data/api.js';
import Button from '../ui/Button';
import Input from '../ui/Input';
import CloseButton from "../ui/CloseButton";

const WorkerForm = ({ onClose, onSubmit, initialData, isEdit = false }) => {

  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    department_id: '',  
    pagoPorHora: '',
  });

  const [departments, setDepartments] = useState([]);
  const [loadingDeps, setLoadingDeps] = useState(true);
  const [errorDeps, setErrorDeps] = useState("");

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const res = await api("/departments"); 
        if (active) setDepartments(res?.data ?? []);
      } catch (e) {
        if (active) setErrorDeps(e.message || "No se pudieron cargar los departamentos");
      } finally {
        if (active) setLoadingDeps(false);
      }
    })();
    return () => { active = false; };
  }, []);

  useEffect(() => {
    if (initialData) {
      setFormData({
        nombre: initialData.nombre || '',
        apellido: initialData.apellido || '',
        department_id: initialData.department_id ?? '',
        pagoPorHora: initialData.pagoPorHora ?? '',
      });
    }
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(f => ({ ...f, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      nombre: formData.nombre.trim(),
      apellido: formData.apellido.trim(),
      department_id: Number(formData.department_id),
      pagoPorHora: Number(String(formData.pagoPorHora).replace(',', '.')),
    });
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
              placeholder="Ej: Pérez"
              className="text-base"
            />
          </div>

          <div className="space-y-1">
            <label className="block text-sm font-medium text-[#1E1E1E]">
              Departamento
            </label>
            <select
              name="department_id"
              value={formData.department_id}
              onChange={handleChange}
              className="w-full px-3 py-2.5 border border-[#D1D5DB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#209E7F] focus:border-transparent transition-colors duration-200 text-[#4B5563]"
              required
              disabled={loadingDeps || !!errorDeps}
            >
              <option value="">
                {loadingDeps ? "Cargando..." : (errorDeps ? "Error al cargar" : "Seleccionar departamento")}
              </option>
              {!loadingDeps && !errorDeps && departments.map((dep) => (
                <option key={dep.id} value={dep.id}>
                  {dep.name}
                </option>
              ))}
            </select>
            {errorDeps && <p className="text-red-600 text-sm mt-1">{errorDeps}</p>}
          </div>

          <Input
            label="Salario por hora ($)"
            name="pagoPorHora"
            type="number"
            step="0.01"
            required
            value={formData.pagoPorHora}
            onChange={handleChange}
            placeholder="0.00"
            min="0"
            className="text-base"
          />

          <div className="flex space-x-3 pt-4">
            <Button type="button" variant="secondary" onClick={onClose} className="flex-1 py-2.5">
              Cancelar
            </Button>
            <Button type="submit" variant="primary" className="flex-1 py-2.5">
              {isEdit ? 'Guardar Cambios' : 'Agregar Trabajador'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default WorkerForm;
