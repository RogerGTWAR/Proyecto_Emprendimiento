import Button from '../ui/Button';

const ProductsCard = ({ products: product, onVerDetalles}) => {
  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden hover:shadow-md transition-shadow duration-200 h-full flex flex-col">
      <div className="h-48 overflow-hidden">
        <img 
          src={product.imagen} 
          alt={product.nombre}
          className="w-full h-full object-cover"
        />
      </div>
      <div className="p-4 flex flex-col flex-grow">
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-semibold text-gray-800 text-lg line-clamp-1">{product.nombre}</h3>
          <span className="inline-block px-2 py-1 bg-yellow-100 text-green-800 text-xs font-medium rounded-full capitalize shrink-0 ml-2"> 
            MG: {product.profit_margin} %</span>
        </div>
          <p className="text-gray-600 text-sm mb-3 line-clamp-3 flex-grow">{product.description}</p>
        <div className="pb-4 flex-grow">
          <h3 className="text-sm font-bold text-gray-800"> 
            Tiempo estimado: {product.estimated_time} Minutos
          </h3>
        </div>
        <Button
          variant="primary"
          className="w-full"
          onClick={() => onVerDetalles(product)}
        >
          Más información
        </Button>
      </div>
    </div>
  );
};

export default ProductsCard;