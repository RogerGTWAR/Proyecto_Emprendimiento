import Button from '../ui/Button';

const MaterialCard = ({ material, onVerDetalles, formatearPrecio }) => {
  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow duration-200 h-full flex flex-col">
      <div className="h-48 overflow-hidden">
        <img 
          src={material.imagen} 
          alt={material.nombre}
          className="w-full h-full object-cover"
        />
      </div>
      <div className="p-4 flex flex-col flex-grow">
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-semibold text-gray-800 text-lg line-clamp-1">{material.nombre}</h3>
          <span className="inline-block px-2 py-1 bg-yellow-100 text-green-800 text-xs font-medium rounded-full capitalize shrink-0 ml-2">
            {material.tipo}
          </span>
        </div>
        <p className="text-gray-600 text-sm mb-3 line-clamp-3 flex-grow">{material.descripcion}</p>
        <div className="flex justify-between items-center mb-4">
          <span className="text-lg font-bold text-gray-800">{formatearPrecio(material.costo)}</span>
          <span className="text-sm text-gray-500">{material.cantidad} {material.unidad}</span>
        </div>
        <Button
          variant="primary"
          className="w-full"
          onClick={() => onVerDetalles(material)}
        >
          Más información
        </Button>
      </div>
    </div>
  );
};

export default MaterialCard;