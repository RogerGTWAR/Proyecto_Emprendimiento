import { useState } from 'react';
import CloseButton from "../ui/CloseButton";
import ButtonIcon from '../ui/ButtonIcon'; 
import DeleteConfirmationModal from '../ui/DeleteConfirmationModal';

const ProductsDetails = ({ products, onCerrar, onEliminar, }) => {
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  if (!products) return null;

  const handleDeleteClick = () => {
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    setIsDeleting(true);
    try {
      await onEliminar(products.id);
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

  const DeleteIcon = () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
    </svg>
  );

  return (
    <>
      <div className="p-6">

        <div className="flex justify-between items-center mb-6 relative">
          <h1 className="text-2xl font-bold text-gray-800">Detalles del Producto</h1>
          <CloseButton onClick={onCerrar} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

          <div className="h-64">
            <img 
              src={products.imagen} 
              alt={products.nombre}
              className="w-full h-full object-cover rounded-lg"
            />
          </div>
          
          <div className="space-y-4">
            <div>
              <h2 className="text-xl font-bold text-gray-800 mb-2">Tiempo Estimado: </h2>
              <span className="inline-block px-3 py-1 bg-teal-100 text-teal-800 text-sm font-medium rounded-full capitalize">
                {products.estimated_time}
              </span>
            </div>
            
            <div className="space-y-3">
              <div className="max-h-32 overflow-y-auto">
                <h3 className="text-sm font-medium text-gray-600 mb-1">Descripción</h3>
                <p className="text-gray-800 whitespace-pre-wrap">{products.descripcion}</p>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-600 mb-1">Margen de Ganancia: </h3>
                  <p className="text-gray-800">{products.profit_margin}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-600 mb-1">Materiales usados</h3>
                    {products.materials && products.materials.length > 0 ? (
                    <ul className="list-disc list-inside max-h-40 overflow-y-auto text-gray-800">
                      {products.materials.map((mat, index) => (
                    <li key={index}>
                        {mat.material_name} - Cantidad: {mat.quantity}
                      </li>
                      ))}
                    </ul>
                  ) : (
                  <p className="text-gray-600">No hay materiales asociados.</p>
                  )}
                </div>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3 pt-4">
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

      {/* Modal de confirmación */}
      <DeleteConfirmationModal
        isOpen={showDeleteModal}
        onClose={handleCancelDelete}
        onConfirm={handleConfirmDelete}
        itemName={products.nombre}
        loading={isDeleting}
      />
    </>
  );
};

export default ProductsDetails;