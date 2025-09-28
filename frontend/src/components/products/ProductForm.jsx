import { useState, useEffect, useRef } from 'react';
import Button from '../ui/Button';
import CloseButton from "../ui/CloseButton";
import MaterialCardAvailable from './MaterialCardAvailable';
import MaterialCardNeeded from './MaterialCardNeeded';
import MaterialDetails from '../materials/MaterialDetails';
import { useMaterials } from '../../hooks/useMaterials';

const ProductForm = ({ onClose, onSubmit, initialData, isEdit = false }) => {
  const [formData, setFormData] = useState({
    nombre: '',
    description: '',
    estimated_time: '',
    imagen: null,
    materials: []
  });

  const [previewUrl, setPreviewUrl] = useState('');
  const [focusedField, setFocusedField] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [totalCost, setTotalCost] = useState(0);
  const [selectedMaterial, setSelectedMaterial] = useState(null);
  const [showMaterialDetails, setShowMaterialDetails] = useState(false);

  const { items: availableMaterials, loading: loadingMaterials, error: errorMaterials } = useMaterials();
  const formRef = useRef(null);

  useEffect(() => {
    if (initialData) {
      setFormData({
        nombre: initialData.nombre || '',
        description: initialData.description || '',
        estimated_time: initialData.estimated_time || '',
        imagen: initialData.imagen || null,
        materials: initialData.materials || []
      });

      if (initialData.imagenUrl) {
        setPreviewUrl(initialData.imagenUrl);
      } else if (initialData.imagen && typeof initialData.imagen === 'string') {
        setPreviewUrl(initialData.imagen);
      } else {
        setPreviewUrl('');
      }
    }
  }, [initialData]);

  useEffect(() => {
    const cost = (formData.materials || []).reduce((total, material) => {
      const units = Number(material.units ?? 1);
      const waste = Number(material.waste ?? 0);
      // Fallbacks por si tu API usa otras claves de precio
      const unitCost = Number(
        material.costo ?? material.precio ?? material.price ?? material.unit_price ?? 0
      );
      return total + unitCost * units * (1 + waste / 100);
    }, 0);
    setTotalCost(cost);
  }, [formData.materials]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
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

  const handleDragStart = (e, material) => {
    e.dataTransfer.setData('material', JSON.stringify(material));
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const raw = e.dataTransfer.getData('material');
    if (!raw) return;
    let materialData = null;
    try {
      materialData = JSON.parse(raw);
    } catch {
      return;
    }
    if (!materialData?.id) return;

    const exists = (formData.materials || []).some(m => m.id === materialData.id);
    if (!exists) {
      setFormData(prev => ({
        ...prev,
        materials: [...(prev.materials || []), { ...materialData, units: 1, waste: 0 }]
      }));
    }
  };

  const handleDragOver = (e) => e.preventDefault();

  const handleRemoveMaterial = (materialId) => {
    setFormData(prev => ({
      ...prev,
      materials: (prev.materials || []).filter(m => m.id !== materialId)
    }));
  };

  const handleUpdateMaterial = (materialId, units, waste) => {
    setFormData(prev => ({
      ...prev,
      materials: (prev.materials || []).map(m =>
        m.id === materialId ? { ...m, units, waste } : m
      )
    }));
  };

  const handleOpenMaterialDetails = (material) => {
    setSelectedMaterial(material);
    setShowMaterialDetails(true);
  };

  const handleCloseMaterialDetails = () => {
    setShowMaterialDetails(false);
    setSelectedMaterial(null);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const filteredMaterials = (availableMaterials || []).filter(material => {
    const nombre = (material.nombre || material.name || '').toLowerCase();
    const tipo = (material.tipo || material.type || '').toLowerCase();
    const term = searchTerm.toLowerCase();
    return nombre.includes(term) || tipo.includes(term);
  });

  const formatearPrecio = (precio) => `$${Number(precio || 0).toFixed(2)}`;

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-between p-4 border-b border-[#D1D5DB]">
            <h2 className="text-xl font-semibold text-[#1E1E1E]">
              {isEdit ? 'Editar Producto' : 'Agregar Producto'}
            </h2>
            <CloseButton onClick={onClose} />
          </div>

          <div className="flex flex-col md:flex-row">
            {/* Columna izquierda: Formulario */}
            <div className="md:w-2/3 p-5 border-r border-gray-200">
              <form ref={formRef} onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-base font-medium text-[#1E1E1E] mb-1">
                      Nombre del Producto
                    </label>
                    <input
                      name="nombre"
                      type="text"
                      required
                      value={formData.nombre}
                      onChange={handleChange}
                      onFocus={() => handleFocus('nombre')}
                      onBlur={handleBlur}
                      placeholder="Ej: Mesa de comedor"
                      className="w-full px-4 py-2.5 border border-[#D1D5DB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#209E7F] focus:border-transparent transition-colors duration-200 text-[#4B5563]"
                    />
                  </div>

                  <div>
                    <label className="block text-base font-medium text-[#1E1E1E] mb-1">
                      Tiempo Estimado (minutos)
                    </label>
                    <input
                      name="estimated_time"
                      type="number"
                      min="1"
                      required
                      value={formData.estimated_time}
                      onChange={handleChange}
                      onFocus={() => handleFocus('estimated_time')}
                      onBlur={handleBlur}
                      placeholder="Ej: 120 minutos"
                      className="w-full px-4 py-2.5 border border-[#D1D5DB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#209E7F] focus:border-transparent transition-colors duration-200 text-[#4B5563]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-base font-medium text-[#1E1E1E] mb-1">
                    Descripción
                  </label>
                  <textarea
                    name="description"
                    rows={4}
                    value={formData.description}
                    onChange={handleChange}
                    onFocus={() => handleFocus('description')}
                    onBlur={handleBlur}
                    className="w-full px-4 py-2.5 border border-[#D1D5DB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#209E7F] focus:border-transparent transition-colors duration-200 text-[#4B5563] resize-vertical"
                    placeholder="Describe las características del producto..."
                    required
                  />
                </div>

                {/* Imagen */}
                <div>
                  <label className="block text-base font-medium text-[#1E1E1E] mb-1">
                    Imagen del Producto
                  </label>

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
                        aria-label="Eliminar imagen"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  ) : (
                    <label
                      className={`flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-[#D1D5DB] rounded-lg cursor-pointer hover:bg-[#F5F7FA] transition-colors duration-200 ${focusedField === 'imagen' ? 'ring-2 ring-[#209E7F]' : ''}`}
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
                        name="imagen"
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

                {/* Materiales necesarios */}
                <div className="pt-4">
                  <h3 className="text-lg font-medium mb-2">Materiales Necesarios</h3>
                  <p className="text-sm text-gray-500 mb-3">Arrastra materiales desde el panel de la derecha</p>

                  <div
                    className="border-2 border-dashed border-gray-300 rounded-lg p-4 min-h-40 max-h-60 overflow-y-auto"
                    onDrop={handleDrop}
                    onDragOver={handleDragOver}
                  >
                    {formData.materials.length === 0 ? (
                      <p className="text-center text-gray-500 py-8">
                        Arrastra materiales aquí desde el panel de la derecha
                      </p>
                    ) : (
                      <div className="space-y-3">
                        {formData.materials.map(material => (
                          <MaterialCardNeeded
                            key={material.id}
                            material={material}
                            onUpdate={handleUpdateMaterial}
                            onRemove={handleRemoveMaterial}
                            onOpenModal={handleOpenMaterialDetails}
                          />
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="mt-4 flex justify-between items-center">
                    <div className="text-lg font-semibold">
                      Costo Total: ${totalCost.toFixed(2)}
                    </div>
                  </div>
                </div>

                <div className="flex space-x-3 pt-4">
                  <Button type="button" variant="secondary" onClick={onClose} className="flex-1 py-2.5">
                    Cancelar
                  </Button>
                  <Button type="submit" variant="primary" className="flex-1 py-2.5">
                    {isEdit ? 'Guardar Cambios' : 'Agregar Producto'}
                  </Button>
                </div>
              </form>
            </div>

            {/* Columna derecha: Materiales disponibles */}
            <div className="hidden md:block md:w-1/3 p-5 bg-gray-50">
              <h3 className="text-lg font-medium mb-4">Materiales Disponibles</h3>

              <div className="mb-4">
                <input
                  type="text"
                  placeholder="Buscar materiales..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-4 py-2.5 border border-[#D1D5DB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#209E7F] focus:border-transparent transition-colors duration-200 text-[#4B5563]"
                />
              </div>

              {loadingMaterials ? (
                <div className="text-sm text-gray-500">Cargando materiales...</div>
              ) : errorMaterials ? (
                <div className="text-sm text-red-600">{errorMaterials}</div>
              ) : (
                <div className="space-y-3 max-h-[calc(100vh-300px)] overflow-y-auto">
                  {filteredMaterials.map(material => (
                    <MaterialCardAvailable
                      key={material.id}
                      material={material}
                      onDragStart={handleDragStart}
                    />
                  ))}
                  {filteredMaterials.length === 0 && (
                    <p className="text-sm text-gray-500">No hay materiales que coincidan con la búsqueda.</p>
                  )}
                </div>
              )}
            </div>

            {/* Materiales disponibles en móvil */}
            <div className="md:hidden bg-gray-50 p-4 rounded-lg">
              <h3 className="text-lg font-medium mb-4">Materiales Disponibles</h3>

              <div className="mb-4">
                <input
                  type="text"
                  placeholder="Buscar materiales..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-4 py-2.5 border border-[#D1D5DB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#209E7F] focus:border-transparent transition-colors duration-200 text-[#4B5563]"
                />
              </div>

              {loadingMaterials ? (
                <div className="text-sm text-gray-500">Cargando materiales...</div>
              ) : errorMaterials ? (
                <div className="text-sm text-red-600">{errorMaterials}</div>
              ) : (
                <div className="space-y-3 max-h-60 overflow-y-auto">
                  {filteredMaterials.map(material => (
                    <MaterialCardAvailable
                      key={material.id}
                      material={material}
                      onDragStart={handleDragStart}
                    />
                  ))}
                  {filteredMaterials.length === 0 && (
                    <p className="text-sm text-gray-500">No hay materiales que coincidan con la búsqueda.</p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {showMaterialDetails && selectedMaterial && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <MaterialDetails
              material={selectedMaterial}
              onCerrar={handleCloseMaterialDetails}
              onEditar={() => {
                console.log("Editar material:", selectedMaterial);
                handleCloseMaterialDetails();
              }}
              onEliminar={(id) => {
                console.log("Eliminar material:", id);
                handleCloseMaterialDetails();
              }}
              formatearPrecio={formatearPrecio}
            />
          </div>
        </div>
      )}
    </>
  );
};

export default ProductForm;
