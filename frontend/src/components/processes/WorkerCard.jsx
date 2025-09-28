import CloseButton from '../ui/CloseButton';

const WorkerCard = ({ worker, onRemove }) => {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-3 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-[#209E7F] hover:bg-[#32C3A2]  rounded-full flex items-center justify-center">
            <span className="text-white font-semibold text-sm">
              {worker.nombre?.charAt(0)}{worker.apellido?.charAt(0)}
            </span>
          </div>
          <div>
            <h4 className="font-medium text-gray-700">
              {worker.nombre} {worker.apellido}
            </h4>
            <p className="text-sm text-gray-500">{worker.departamento}</p>
          </div>
        </div>
        
        <CloseButton
          onClick={() => onRemove(worker.id)}
          title="Eliminar trabajador"
        />
      </div>
    </div>
  );
};

export default WorkerCard;