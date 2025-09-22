const MaterialCardAvailable = ({ material, onDragStart }) => {
  return (
    <div
      draggable
      onDragStart={(e) => onDragStart(e, material)}
      className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 cursor-move hover:shadow-md transition-shadow"
    >
      <div className="flex items-center space-x-3">
        <img 
          src={material.imagen} 
          alt={material.nombre}
          className="w-12 h-12 object-cover rounded-md flex-shrink-0"
        />
        <div className="flex-1 min-w-0">
          <div className="flex justify-between items-center">
            <h4 className="font-medium text-sm truncate">{material.nombre}</h4>
            <span className="inline-block px-2 py-1 bg-yellow-100 text-green-800 text-xs font-medium rounded-full capitalize shrink-0 ml-2">
              {material.tipo}
            </span>
          </div>
          <div className="flex justify-between items-center mt-1">
            <p className="text-xs text-gray-500">${material.costo.toFixed(2)}</p>
            <p className="text-xs text-gray-500">{material.cantidad} {material.unidad}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MaterialCardAvailable;