const DashboardPage = () => {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-[#1E1E1E] mb-4">Dashboard Principal</h1>
      <p className="text-[#4B5563]">Bienvenido al panel de control de MateriaLab</p>
      
      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-[#D1D5DB]">
          <h2 className="text-lg font-semibold text-[#1E1E1E] mb-2">Resumen</h2>
          <p className="text-[#4B5563]">Esta es la página principal de tu dashboard.</p>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;