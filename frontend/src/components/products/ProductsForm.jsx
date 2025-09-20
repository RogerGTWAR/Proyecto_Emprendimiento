import { useState, useEffect } from 'react';
import Button from '../ui/Button';
import Input from '../ui/Input';
import CloseButton from "../ui/CloseButton";

const ProductForm = ({ onClose, onSubmit, initialData, isEdit = false }) => {
const [formData, setFormData] = useState({
    nombre: '',
    description: '',
    estimated_time: '',
    profit_margin: '',
    imagen: null,
});

const [previewUrl, setPreviewUrl] = useState('');
const [focusedField, setFocusedField] = useState(null);

useEffect(() => {
    if (initialData) {
    setFormData({
        nombre: initialData.nombre || '',
        description: initialData.description || '',
        estimated_time: initialData.estimated_time || '',
        profit_margin: initialData.profit_margin || '',
        imagen: initialData.imagen || null,
    });

    if (initialData.imagenUrl) {
        setPreviewUrl(initialData.imagenUrl);
    } else if (initialData.imagen && typeof initialData.imagen === 'string') {
        // Si imagen es URL string
        setPreviewUrl(initialData.imagen);
    }
    }
}, [initialData]);

const handleChange = (e) => {
    setFormData({
    ...formData,
    [e.target.name]: e.target.value,
    });
};

const handleFocus = (fieldName) => {
    setFocusedField(fieldName);
};

const handleBlur = () => {
    setFocusedField(null);
};

const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
    setFormData({
        ...formData,
        imagen: file,
    });

    const reader = new FileReader();
    reader.onload = () => {
        setPreviewUrl(reader.result);
    };
    reader.readAsDataURL(file);
    }
};

const removeImage = () => {
    setFormData({
    ...formData,
    imagen: null,
    });
    setPreviewUrl('');
};

const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
};

return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
    <div className="bg-white rounded-xl shadow-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto">

        <div className="flex items-center justify-between p-4 border-b border-[#D1D5DB]">
        <h2 className="text-xl font-semibold text-[#1E1E1E]">
            {isEdit ? 'Editar Producto' : 'Agregar Producto'}
        </h2>
        <CloseButton onClick={onClose} />
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">

        <Input
            label="Nombre del Producto"
            name="nombre"
            type="text"
            required
            value={formData.nombre}
            onChange={handleChange}
            onFocus={() => handleFocus('nombre')}
            onBlur={handleBlur}
            placeholder="Ej: Mesa de comedor"
            className="text-base"
        />

        <div className="space-y-1">
            <label className="block text-sm font-medium text-[#1E1E1E]">
            Tiempo Estimado
            </label>
            <input
                name="estimated_time"
                type="text"
                required
                value={formData.estimated_time}
                onChange={handleChange}
                onFocus={() => handleFocus('estimated_time')}
                onBlur={handleBlur}
                placeholder="Ej: 3 días"
                className="w-full px-3 py-2 border border-[#D1D5DB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#209E7F] focus:border-transparent transition-colors duration-200 text-[#4B5563]"
            />
        </div>

        <div className="space-y-1">
            <label className="block text-sm font-medium text-[#1E1E1E]">
                Margen de Ganancia
            </label>
            <input
                name="profit_margin"
                type="text"
                required
                value={formData.profit_margin}
                onChange={handleChange}
                onFocus={() => handleFocus('profit_margin')}
                onBlur={handleBlur}
                placeholder="Ej: 20%"
                className="w-full px-3 py-2 border border-[#D1D5DB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#209E7F] focus:border-transparent transition-colors duration-200 text-[#4B5563]"
            />
        </div>

        <div className="space-y-1">
            <label className="block text-sm font-medium text-[#1E1E1E]">
                Descripción
            </label>
            <textarea
                name="description"
                rows={4}
                value={formData.description}
                onChange={handleChange}
                onFocus={() => handleFocus('descripcion')}
                onBlur={handleBlur}
                className="w-full px-3 py-2 border border-[#D1D5DB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#209E7F] focus:border-transparent transition-colors duration-200 text-[#4B5563] resize-vertical"
                placeholder="Describe las características del producto..."
                required
            />  
        </div>

        <div className="space-y-2">
            <label className="block text-sm font-medium text-[#1E1E1E]">
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
            <Button type="button" variant="secondary" onClick={onClose} className="flex-1 py-2.5">
                Cancelar
            </Button>
            <Button type="submit" variant="primary" className="flex-1 py-2.5">
                {isEdit ? 'Guardar Cambios' : 'Agregar Producto'}
            </Button>
        </div>
        </form>
    </div>
    </div>
);
};

export default ProductForm;