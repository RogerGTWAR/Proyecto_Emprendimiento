import { useState, useEffect, useRef } from 'react';
import Button from '../ui/Button';
import CloseButton from "../ui/CloseButton";

const CompanyForm = ({ onClose, onSubmit, initialData, isEdit = false }) => {
  const [formData, setFormData] = useState({
    nombre: '',
    tipo_empresa: '',  
    descripcion: '',
    direccion: '',
    telefono: '',
    email: '',
    logo: null
  });

  const [previewUrl, setPreviewUrl] = useState('');
  const [focusedField, setFocusedField] = useState(null);
  const formRef = useRef(null);
 
  const tiposEmpresa = [
    { value: '', label: 'Selecciona el tipo de empresa' },
    { value: 'manufactura', label: 'Manufactura' },
    { value: 'carpintería', label: 'Carpintería' },
    { value: 'comercio', label: 'Comercio' },
    { value: 'tecnologia', label: 'Tecnología' },
    { value: 'construccion', label: 'Construcción' }, 
    { value: 'otro', label: 'Otro' }
  ];

  useEffect(() => {
    if (initialData) {
      setFormData({
        nombre: initialData.nombre || '',
        tipo_empresa: initialData.tipo_empresa || '',
        descripcion: initialData.descripcion || '',
        direccion: initialData.direccion || '',
        telefono: initialData.telefono || '',
        email: initialData.email || '',
        logo: initialData.logo || null
      });

      if (initialData.logo) {
        setPreviewUrl(initialData.logo);
      }
    }
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFocus = (fieldName) => {
    setFocusedField(fieldName);
  };

  const handleBlur = () => {
    setFocusedField(null);
  };

  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert('La imagen es demasiado grande. Máximo 5MB permitido.');
        return;
      }

      setFormData(prev => ({
        ...prev,
        logo: file,
      }));

      const reader = new FileReader();
      reader.onload = () => {
        setPreviewUrl(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeLogo = () => {
    setFormData(prev => ({
      ...prev,
      logo: null,
    }));
    setPreviewUrl('');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-[#D1D5DB]">
          <h2 className="text-xl font-semibold text-[#1E1E1E]">
            {isEdit ? 'Editar Información de la Empresa' : 'Agregar Información de la Empresa'}
          </h2>
          <CloseButton onClick={onClose} />
        </div>

        <div className="p-6">
          <form ref={formRef} onSubmit={handleSubmit} className="space-y-6">
        
            <div>
              <label className="block text-base font-medium text-[#1E1E1E] mb-3">
                Logo de la Empresa (Opcional)
              </label>
              
              {previewUrl ? (
                <div className="flex flex-col items-center">
                  <div className="relative">
                    <img 
                      src={previewUrl} 
                      alt="Logo preview" 
                      className="w-32 h-32 object-cover rounded-full border-2 border-[#D1D5DB]"
                    />
                    <button
                      type="button"
                      onClick={removeLogo}
                      className="absolute -top-2 -right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600 transition-colors"
                      aria-label="Eliminar logo"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                  <p className="text-sm text-gray-500 mt-2">Logo actual</p>
                </div>
              ) : (
                <label 
                  className={`flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-[#D1D5DB] rounded-lg cursor-pointer hover:bg-[#F5F7FA] transition-colors duration-200 ${focusedField === 'logo' ? 'ring-2 ring-[#209E7F]' : ''}`}
                  onFocus={() => handleFocus('logo')}
                  onBlur={handleBlur}
                  tabIndex={0}
                >
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <svg className="w-12 h-12 text-[#4B5563] mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <p className="text-sm font-medium text-[#4B5563] mb-1">Haz clic para subir logo</p>
                    <p className="text-xs text-[#4B5563]">PNG, JPG, JPEG (MAX. 5MB)</p>
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleLogoChange}
                    className="hidden"
                  />
                </label>
              )}
            </div>
 
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-base font-medium text-[#1E1E1E] mb-2">
                  Nombre de la Empresa *
                </label>
                <input
                  name="nombre"
                  type="text"
                  required
                  value={formData.nombre}
                  onChange={handleChange}
                  onFocus={() => handleFocus('nombre')}
                  onBlur={handleBlur}
                  placeholder="Ej: Mi Empresa S.A."
                  className="w-full px-4 py-2.5 border border-[#D1D5DB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#209E7F] focus:border-transparent transition-colors duration-200 text-[#4B5563]"
                />
              </div>
              
              
              <div>
                <label className="block text-base font-medium text-[#1E1E1E] mb-2">
                  Tipo de Empresa *
                </label>
                <select
                  name="tipo_empresa"
                  required
                  value={formData.tipo_empresa}
                  onChange={handleChange}
                  onFocus={() => handleFocus('tipo_empresa')}
                  onBlur={handleBlur}
                  className="w-full px-4 py-2.5 border border-[#D1D5DB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#209E7F] focus:border-transparent transition-colors duration-200 text-[#4B5563] bg-white"
                >
                  {tiposEmpresa.map((tipo) => (
                    <option key={tipo.value} value={tipo.value}>
                      {tipo.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-base font-medium text-[#1E1E1E] mb-2">
                  Teléfono
                </label>
                <input
                  name="telefono"
                  type="tel"
                  value={formData.telefono}
                  onChange={handleChange}
                  onFocus={() => handleFocus('telefono')}
                  onBlur={handleBlur}
                  placeholder="Ej: +505 1234 5678"
                  className="w-full px-4 py-2.5 border border-[#D1D5DB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#209E7F] focus:border-transparent transition-colors duration-200 text-[#4B5563]"
                />
              </div>

              <div>
                <label className="block text-base font-medium text-[#1E1E1E] mb-2">
                  Email de Contacto
                </label>
                <input
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  onFocus={() => handleFocus('email')}
                  onBlur={handleBlur}
                  placeholder="Ej: contacto@miempresa.com"
                  className="w-full px-4 py-2.5 border border-[#D1D5DB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#209E7F] focus:border-transparent transition-colors duration-200 text-[#4B5563]"
                />
              </div>
            </div>

            <div>
              <label className="block text-base font-medium text-[#1E1E1E] mb-2">
                Descripción de la Empresa
              </label>
              <textarea
                name="descripcion"
                rows={3}
                value={formData.descripcion}
                onChange={handleChange}
                onFocus={() => handleFocus('descripcion')}
                onBlur={handleBlur}
                className="w-full px-4 py-2.5 border border-[#D1D5DB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#209E7F] focus:border-transparent transition-colors duration-200 text-[#4B5563] resize-vertical"
                placeholder="Describe los servicios o productos de tu empresa..."
              />
            </div>

            <div>
              <label className="block text-base font-medium text-[#1E1E1E] mb-2">
                Dirección
              </label>
              <input
                name="direccion"
                type="text"
                value={formData.direccion}
                onChange={handleChange}
                onFocus={() => handleFocus('direccion')}
                onBlur={handleBlur}
                placeholder="Ej: Calle Principal #123, Ciudad, País"
                className="w-full px-4 py-2.5 border border-[#D1D5DB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#209E7F] focus:border-transparent transition-colors duration-200 text-[#4B5563]"
              />
            </div>

          
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
                {isEdit ? 'Guardar Cambios' : 'Guardar Información'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CompanyForm;