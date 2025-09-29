import { useState, useEffect } from 'react';
import Button from '../ui/Button';
import Input from '../ui/Input';
import CloseButton from "../ui/CloseButton";

const MaterialForm = ({ onClose, initialData, isEdit = false, onSaved }) => {
  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
    tipo: '',
    cantidad: '',
    medidas: '',
    tamaño: '',
    costo: '',
    imagen: null,
    material_unit_id: ''
  });

  const [previewUrl, setPreviewUrl] = useState('');
  const [focusedField, setFocusedField] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const [loadingUnits] = useState(false);
  const [unitsError] = useState('');

  useEffect(() => {
    if (initialData) {
      setFormData(prev => ({
        ...prev,
        nombre: initialData.nombre || '',
        descripcion: initialData.descripcion || '',
        tipo: initialData.tipo ?? initialData.type ?? '',
        cantidad: initialData.cantidad ?? '',
        medidas: initialData.medidas || '',
        tamaño: initialData.tamaño || '',
        costo: initialData.costo ?? '',
        imagen: null, 
        material_unit_id: initialData.material_unit_id ?? ''
      }));
      setPreviewUrl(initialData.imagen || '');
    } else {
      setPreviewUrl('');
    }
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === "material_unit_id" ? Number(value) || "" : value
    }));
  };

  const handleFocus = (fieldName) => setFocusedField(fieldName);
  const handleBlur = () => setFocusedField(null);

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData(prev => ({ ...prev, imagen: file }));
      const reader = new FileReader();
      reader.onload = () => setPreviewUrl(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setFormData(prev => ({ ...prev, imagen: null }));
    setPreviewUrl('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.material_unit_id) {
      alert('Selecciona una unidad de medida');
      return;
    }

    const payload = {
      nombre: formData.nombre,
      descripcion: formData.descripcion,
      costo: formData.costo,
      waste_percentage: 0,
      company_id: 1,
      material_unit_id: formData.material_unit_id,
      cantidad: formData.cantidad,
      medidas: formData.medidas,
      tamaño: formData.tamaño,
      imagen: formData.imagen, // File/Blob si el usuario subió
      type: formData.tipo,
    };

    setSubmitting(true);
    try {
      // 👇 Ahora NO llamamos a la API aquí
      await onSaved?.(payload); // El padre hará create/update y actualizará el estado con la respuesta del backend
      onClose?.();
    } catch (err) {
      console.error(err);
      alert(err?.message || 'No se pudo guardar el material');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-4 border-b border-[#D1D5DB]">
          <h2 className="text-xl font-semibold text-[#1E1E1E]">
            {isEdit ? 'Editar Material' : 'Agregar Material'}
          </h2>
          <CloseButton onClick={onClose} />
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-[2fr_1fr] gap-3">
            <Input
              label="Nombre del Material"
              name="nombre"
              type="text"
              required
              value={formData.nombre}
              onChange={handleChange}
              onFocus={() => handleFocus('nombre')}
              onBlur={handleBlur}
              placeholder="Ej: Madera de pino"
              className="text-base"
            />

            <div className="space-y-1">
              <label className="block text-sm font-medium text-[#1E1E1E]">Tipo</label>
              <select
                name="tipo"
                value={formData.tipo}
                onChange={handleChange}
                onFocus={() => handleFocus('tipo')}
                onBlur={handleBlur}
                className="w-full px-3 py-2.5 border border-[#D1D5DB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#209E7F] focus:border-transparent transition-colors duration-200 text-[#4B5563]"
                required
              >
                <option value="">Seleccionar tipo</option>
                <option value="madera">Madera</option>
                <option value="textil">Textil</option>
                <option value="cuero">Cuero</option>
                <option value="alimento">Alimento</option>
                <option value="sin etiqueta">Sin etiqueta</option>
              </select>
            </div>
          </div>

          <div className="space-y-1">
            <label className="block text-sm font-medium text-[#1E1E1E]">Descripción</label>
            <textarea
              name="descripcion"
              rows={4}
              value={formData.descripcion}
              onChange={handleChange}
              onFocus={() => handleFocus('descripcion')}
              onBlur={handleBlur}
              className="w-full px-3 py-2 border border-[#D1D5DB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#209E7F] focus:border-transparent transition-colors duración-200 text-[#4B5563] resize-vertical"
              placeholder="Describe las características del material..."
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Cantidad"
              name="cantidad"
              type="number"
              required
              value={formData.cantidad}
              onChange={handleChange}
              onFocus={() => handleFocus('cantidad')}
              onBlur={handleBlur}
              placeholder="0"
              min="0"
              className="text-base"
            />

            <div className="space-y-1">
              <label className="block text-sm font-medium text-[#1E1E1E]">Tamaño</label>
              <select
                name="tamaño"
                value={formData.tamaño}
                onChange={handleChange}
                onFocus={() => handleFocus('tamaño')}
                onBlur={handleBlur}
                className="w-full px-3 py-2.5 border border-[#D1D5DB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#209E7F] focus:border-transparent transition-colors duración-200 text-[#4B5563]"
              >
                <option value="">Seleccionar tamaño</option>
                <option value="pequeño">Pequeño</option>
                <option value="mediano">Mediano</option>
                <option value="grande">Grande</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Costo"
              name="costo"
              type="number"
              step="0.01"
              required
              value={formData.costo}
              onChange={handleChange}
              onFocus={() => handleFocus('costo')}
              onBlur={handleBlur}
              placeholder="0.00"
              min="0"
              className="text-base"
            />

            <Input
              label="Medidas"
              name="medidas"
              type="text"
              value={formData.medidas}
              onChange={handleChange}
              onFocus={() => handleFocus('medidas')}
              onBlur={handleBlur}
              placeholder="Ej: 10x20x5 cm"
              className="text-base"
            />
          </div>

          <div className="space-y-1">
            <label className="block text-sm font-medium text-[#1E1E1E]">
              Unidad de medida
            </label>

            <select
              name="material_unit_id"
              value={formData.material_unit_id ?? ""}
              onChange={handleChange}
              onFocus={() => handleFocus("material_unit_id")}
              onBlur={handleBlur}
              className="w-full px-3 py-2.5 border border-[#D1D5DB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#209E7F] focus:border-transparent transition-colors duration-200 text-[#4B5563]"
              required
              disabled={loadingUnits || !!unitsError}
            >
              <option value="">
                {loadingUnits ? "Cargando..." : unitsError || "Seleccionar unidad"}
              </option>

              <option value="1">Metro</option>
              <option value="2">Yarda</option>
              <option value="3">Metro cubico</option>
              <option value="4">Pie cuadrado</option>
              <option value="5">Kilogramo</option>
              <option value="6">Libra</option>
              <option value="7">Litro</option>
              <option value="8">Unidad</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-[#1E1E1E]">Imagen del Material</label>

            {previewUrl ? (
              <div className="relative">
                <img
                  src={previewUrl}
                  alt="Preview"
                  className="w-full h-48 object-cover rounded-lg border border-[#D1D5DB]"
                />
                <button
                  type="button"
                  onClick={removeImage}
                  className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600 transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ) : (
              <label
                className={`flex flex-col items-center justify-center w-full h-32 border border-[#D1D5DB] rounded-lg cursor-pointer hover:bg-[#F5F7FA] transition-colors duration-200 ${focusedField === 'imagen' ? 'ring-2 ring-[#209E7F]' : ''}`}
                onFocus={() => handleFocus('imagen')}
                onBlur={handleBlur}
                tabIndex={0}
              >
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <svg className="w-8 h-8 text-[#4B5563] mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <p className="text-sm text-[#4B5563]">Haz clic para subir una imagen</p>
                  <p className="text-xs text-[#4B5563]">PNG, JPG, JPEG (MAX. 5MB)</p>
                </div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                  onFocus={() => handleFocus('imagen')}
                  onBlur={handleBlur}
                />
              </label>
            )}
          </div>

          <div className="flex space-x-3 pt-4">
            <Button
              type="button"
              variant="secondary"
              onClick={onClose}
              className="flex-1 py-2.5"
              disabled={submitting}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              variant="primary"
              className="flex-1 py-2.5"
              disabled={submitting}
            >
              {submitting ? 'Guardando...' : isEdit ? 'Guardar Cambios' : 'Agregar Material'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default MaterialForm;
