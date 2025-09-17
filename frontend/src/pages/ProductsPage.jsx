const ProductsPage = () => {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-[#1E1E1E] mb-4">Gestión de Productos</h1>
      <p className="text-[#4B5563]">Administra los productos de tu empresa.</p>
      
      <div className="mt-6 bg-white p-6 rounded-lg shadow-sm border border-[#D1D5DB]">
        <h2 className="text-lg font-semibold text-[#1E1E1E] mb-4">Lista de Productos</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="border border-[#D1D5DB] rounded-lg p-4">
            <h3 className="font-medium text-[#1E1E1E]">Mesa de centro</h3>
            <p className="text-sm text-[#4B5563]">Precio: $120</p>
          </div>
          <div className="border border-[#D1D5DB] rounded-lg p-4">
            <h3 className="font-medium text-[#1E1E1E]">Silla moderna</h3>
            <p className="text-sm text-[#4B5563]">Precio: $80</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductsPage;