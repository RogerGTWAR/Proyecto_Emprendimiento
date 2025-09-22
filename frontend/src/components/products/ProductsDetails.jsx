import { useState, useRef, useEffect } from 'react';
import CloseButton from "../ui/CloseButton";
import ButtonIcon from '../ui/ButtonIcon'; 
import DeleteConfirmationModal from '../ui/DeleteConfirmationModal';
import MaterialDetails from '../materials/MaterialDetails';

const ProductsDetails = ({ products: product, onCerrar, onEditar, onEliminar }) => {
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showMaterialDetails, setShowMaterialDetails] = useState(false);
  const [selectedMaterial, setSelectedMaterial] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  if (!product) return null;

  const handleDeleteClick = () => {
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    setIsDeleting(true);
    try {
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

  const handleOpenMaterialDetails = (material) => {
    setSelectedMaterial(material);
    setShowMaterialDetails(true);
  };

  const handleCloseMaterialDetails = () => {
    setShowMaterialDetails(false);
    setSelectedMaterial(null);
  };

  const formatearPrecio = (precio) => {
    return `$${precio.toFixed(2)}`;
  };

  const calcularCostoTotal = () => {
    if (!product.materials || product.materials.length === 0) return 0;
    
    return product.materials.reduce((total, material) => {
      const units = material.units || 1;
      const waste = material.waste || 0;
      return total + (material.costo * units * (1 + waste/100));
    }, 0);
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

  const MaterialCard = ({ material }) => {
    const [dropdownAbierto, setDropdownAbierto] = useState(false);
    const dropdownRef = useRef(null);

    const cost = material.costo * (material.units || 1) * (1 + (material.waste || 0)/100);

    useEffect(() => {
      const handleClickOutside = (event) => {
        if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
          setDropdownAbierto(false);
        }
      };

      if (dropdownAbierto) {
        document.addEventListener('mousedown', handleClickOutside);
      }
      
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }, [dropdownAbierto]);

    const toggleDropdown = (e) => {
      e.stopPropagation();
      setDropdownAbierto(!dropdownAbierto);
    };

    const handleMoreInfo = () => {
      handleOpenMaterialDetails(material);
      setDropdownAbierto(false);
    };

    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 mb-3">
        <div className="flex items-start space-x-3">
          <img 
            src={material.imagen} 
            alt={material.nombre}
            className="w-12 h-12 object-cover rounded-md flex-shrink-0"
          />
          <div className="flex-1 min-w-0">
            <div className="flex justify-between items-start">
              <div>
                <h4 className="font-medium text-sm">{material.nombre}</h4>
                <p className="text-xs text-gray-500">${material.costo.toFixed(2)} c/u</p>
              </div>
              
              <div className="relative" ref={dropdownRef}>
                <button 
                  onClick={toggleDropdown}
                  className="text-gray-500 hover:text-gray-700 p-1 rounded hover:bg-gray-100"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                  </svg>
                </button>
                
                {dropdownAbierto && (
                  <div className="absolute right-0 z-50 w-32 mt-1 origin-top-right bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                    <div className="py-1">
                      <button
                        onClick={handleMoreInfo}
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                      >
                        <div className="flex items-center">
                          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          Más info
                        </div>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-2 mt-2">
              <div>
                <label className="text-xs text-gray-600 block mb-1">Unidades</label>
                <p className="text-sm font-medium">{material.units || 1}</p>
              </div>
              <div>
                <label className="text-xs text-gray-600 block mb-1">Desperdicio</label>
                <p className="text-sm font-medium">{material.waste || 0}%</p>
              </div>
            </div>
            
            <div className="flex justify-between items-center mt-2">
              <span className="inline-block px-2 py-1 bg-yellow-100 text-green-800 text-xs font-medium rounded-full capitalize">
                {material.tipo}
              </span>
              <div className="text-xs font-medium">
                Costo: ${cost.toFixed(2)}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <>
      <div className="p-6">
        <div className="flex justify-between items-center mb-6 relative">
          <h1 className="text-2xl font-bold text-gray-800">Detalles del Producto</h1>
          <CloseButton onClick={onCerrar} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <h3 className="font-semibold text-gray-800 text-lg mb-3">{product.nombre}</h3>
              <img 
                src={product.imagen} 
                alt={product.nombre}
                className="w-full h-48 object-cover rounded-lg mb-4"
              />
              
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 p-3 rounded-lg">
                  <h4 className="text-sm font-medium text-gray-600 mb-1">Tiempo Estimado</h4>
                  <p className="text-lg font-bold text-gray-800">{product.estimated_time} min</p>
                </div>
                
                <div className="bg-gray-50 p-3 rounded-lg">
                  <h4 className="text-sm font-medium text-gray-600 mb-1">Costo Total</h4>
                  <p className="text-lg font-bold text-gray-800">${calcularCostoTotal().toFixed(2)}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <h3 className="text-sm font-medium text-gray-600 mb-2">Descripción</h3>
              <p className="text-gray-800 whitespace-pre-wrap">{product.description}</p>
            </div>

            <div className="bg-white rounded-lg p-4 shadow-sm">
              <h3 className="text-sm font-medium text-gray-600 mb-3">Materiales Necesarios</h3>
              <div className="max-h-60 overflow-y-auto">
                {product.materials && product.materials.length > 0 ? (
                  product.materials.map((material, index) => (
                    <MaterialCard key={index} material={material} index={index} />
                  ))
                ) : (
                  <p className="text-gray-600 p-3 bg-gray-50 rounded-lg text-center">
                    No hay materiales asociados.
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

         <div className="flex flex-col sm:flex-row gap-3 pt-6 mt-6">
          <ButtonIcon
            variant="primary"
            onClick={() => onEditar(product)}
            icon={<EditIcon />}
            iconPosition="left"
            className="flex-1"
          >
            Editar Producto
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

      <DeleteConfirmationModal
        isOpen={showDeleteModal}
        onClose={handleCancelDelete}
        onConfirm={handleConfirmDelete}
        itemName={product.nombre}
        loading={isDeleting}
      />

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

export default ProductsDetails;