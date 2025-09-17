import ButtonIcon from './ButtonIcon';
import CloseButton from "./CloseButton";

const DeleteConfirmationModal = ({ isOpen, onClose, onConfirm, itemName, loading }) => {
  if (!isOpen) return null;

  const CloseIcon = () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
  );

  const TrashIcon = () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
    </svg>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="relative bg-white rounded-2xl shadow-lg w-full max-w-md p-6">
        {/* Botón cerrar */}
         <CloseButton onClick={onClose} className="absolute top-3 right-3" />
        {/* Contenido */}
        <div className="text-center space-y-4">
          <svg
            className="mx-auto text-gray-400 w-12 h-12"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>

          <h3 className="text-lg font-medium text-gray-800">
            ¿Está seguro de eliminar <span className="font-semibold text-red-600">{itemName}</span>?
          </h3>

          {/* Botones */}
          <div className="flex justify-center gap-3 pt-4">
            <ButtonIcon
              variant="secondary"
              onClick={onClose}
              disabled={loading}
            >
              Cancelar
            </ButtonIcon>

            <ButtonIcon
              variant="danger"
              onClick={onConfirm}
              loading={loading}
              icon={<TrashIcon />}
            >
              Eliminar
            </ButtonIcon>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeleteConfirmationModal;
