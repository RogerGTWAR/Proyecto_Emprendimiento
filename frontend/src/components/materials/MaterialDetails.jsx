import { useState } from 'react';
import CloseButton from "../ui/CloseButton";
import ButtonIcon from '../ui/ButtonIcon'; 
import DeleteConfirmationModal from '../ui/DeleteConfirmationModal';

const MaterialDetails = ({ material, onCerrar, onEditar, onEliminar, formatearPrecio }) => {
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  if (!material) return null;

  const handleDeleteClick = () => {
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    setIsDeleting(true);
    try {
      await onEliminar(material.id);
      setShowDeleteModal(false);
    } catch (error) {
      console.error('Error al eliminar:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCancelDelete = () => {
    setShowDeleteModal(false);
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
      <div className="p-6">

        <div className="flex justify-between items-center mb-6 relative">
          <h1 className="text-2xl font-bold text-gray-800">Detalles del Material</h1>
          <CloseButton onClick={onCerrar} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

          <div className="h-64">
            <img 
              src={material.imagen} 
              alt={material.nombre}
              className="w-full h-full object-cover rounded-lg"
            />
          </div>
          
          <div className="space-y-4">
            <div>
              <h2 className="text-xl font-bold text-gray-800 mb-2">{material.nombre}</h2>
              <span className="inline-block px-3 py-1 bg-yellow-100 text-teal-800 text-sm font-medium rounded-full capitalize">
                {material.tipo}
              </span>
            </div>
            
            <div className="space-y-3">
              <div className="max-h-32 overflow-y-auto">
                <h3 className="text-sm font-medium text-gray-600 mb-1">Descripción</h3>
                <p className="text-gray-800 whitespace-pre-wrap">{material.descripcion}</p>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-600 mb-1">Cantidad</h3>
                  <p className="text-gray-800">{material.cantidad} {material.unidad}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-600 mb-1">Tamaño</h3>
                  <p className="text-gray-800 capitalize">{material.tamaño}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-600 mb-1">Medidas</h3>
                  <p className="text-gray-800">{material.medidas || 'N/A'}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-600 mb-1">Costo unitario</h3>
                  <p className="text-lg font-bold text-gray-800">{formatearPrecio(material.costo)}</p>
                </div>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              <ButtonIcon
                variant="primary"
                onClick={() => onEditar(material)}
                icon={<EditIcon />}
                iconPosition="left"
                className="flex-1"
              >
                Editar Material
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
        itemName={material.nombre}
        loading={isDeleting}
      />
    </>
  );
};

export default MaterialDetails;