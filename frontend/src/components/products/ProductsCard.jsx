import Button from '../ui/Button';

const ProductsCard = ({ products, onVerDetalles, formatearPrecio }) => {
  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow duration-200 h-full flex flex-col">
      <div className="h-48 overflow-hidden">
        <img 
          src={products.imagen} 
          alt={products.nombre}
          className="w-full h-full object-cover"
        />
      </div>
      <div className="p-4 flex flex-col flex-grow">
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-semibold text-gray-800 text-lg line-clamp-1">{products.nombre}</h3>
          <h3 className="text-sm text-gray-500">{products.nombre}</h3>
          <span className="inline-block px-2 py-1 bg-teal-100 text-teal-800 text-xs font-medium rounded-full capitalize shrink-0 ml-2">
            {products.estimated_time}
          </span>
          <h3 className="text-sm text-gray-500">{products.nombre}</h3>
                    <span className="text-sm text-gray-500">{products.profit_margin} </span>
        </div>
        <p className="text-gray-600 text-sm mb-3 line-clamp-3 flex-grow">{products.descripcion}</p>
        <Button
          variant="primary"
          className="w-full"
          onClick={() => onVerDetalles(products)}
        >
          Más información
        </Button>
      </div>
    </div>
  );
};

export default ProductsCard;