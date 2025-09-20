import { useState } from 'react';
import CloseButton from "../ui/CloseButton";
import ButtonIcon from '../ui/ButtonIcon'; 
import DeleteConfirmationModal from '../ui/DeleteConfirmationModal';

const ProductsDetails = ({ products: product, onCerrar, onEliminar }) => {
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  if (!product) return null;

  const handleDeleteClick = () => {
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    setIsDeleting(true);
    try {
      // Aquí se espera que onEliminar cambie el estado del producto (ej: de 1 a 0)
      await onEliminar(product.id);
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
            <h3 className="font-semibold text-gray-800 text-lg line-clamp-1">{product.nombre}</h3>
            <img 
              src={product.imagen} 
              alt={product.nombre}
              className="w-full h-full object-cover rounded-lg"
            />
          </div>
          
          <div className="space-y-4">
            <div>
              <h2 className="text-xl font-bold text-gray-800 mb-2">Tiempo Estimado: {product.estimated_time} </h2>
            </div>
            
            <div className="space-y-3 max-h-32 overflow-y-auto">
                <h3 className="text-sm font-medium text-gray-600 mb-1">Descripción</h3>
                <p className="text-gray-800 whitespace-pre-wrap">{product.description}</p>
            </div>
              
            <div className="grid grid-cols-2 gap-4">
                {product.materials && product.materials.length > 0 ? (
                  <table className="w-auto text-left text-gray-600 border border-gray-300 rounded-lg overflow-hidden table-auto">
                    <thead className="bg-gray-100">
                      <tr>
                        <th className="border-b border-gray-300 px-4 py-2 whitespace-nowrap">#</th>
                        <th className="border-b border-gray-300 px-4 py-2 whitespace-nowrap">Materiales usados</th>
                        <th className="border-b border-gray-300 px-4 py-2 whitespace-nowrap">Cantidad</th>
                      </tr>
                    </thead>
                    <tbody>
                      {product.materials.map((mat, index) => (
                        <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                          <td className="px-4 border-b border-gray-300">{index + 1}</td>
                          <td className="px-4 border-b border-gray-300">{mat.material_name}</td>
                          <td className="px-4 border-b border-gray-300">{mat.quantity}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <p className="text-gray-600">No hay materiales asociados.</p>
                )}
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              <ButtonIcon
                variant="secondary"
                onClick={handleDeleteClick}
                icon={<DeleteIcon />}
                iconPosition="left"
                className="flex-1"
              >
                Eliminar Producto
              </ButtonIcon>
            </div>
          </div>
        </div>
      </div>

      {/* Modal de confirmación para eliminar producto */}
      <DeleteConfirmationModal
        isOpen={showDeleteModal}
        onClose={handleCancelDelete}
        onConfirm={handleConfirmDelete}
        itemName={product.nombre}
        loading={isDeleting}
      />
    </>
  );
};

export default ProductsDetails;