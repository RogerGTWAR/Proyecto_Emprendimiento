import React from 'react';

const WorkersPage = () => {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-[#1E1E1E] mb-4">Gestión de Trabajadores</h1>
      <p className="text-[#4B5563]">Administra los trabajadores de tu empresa.</p>
      
      <div className="mt-6 bg-white p-6 rounded-lg shadow-sm border border-[#D1D5DB]">
        <h2 className="text-lg font-semibold text-[#1E1E1E] mb-4">Lista de Trabajadores</h2>
        <div className="border border-[#D1D5DB] rounded-lg">
          <table className="w-full">
            <thead className="bg-[#F5F7FA]">
              <tr>
                <th className="p-3 text-left text-sm font-medium text-[#4B5563]">Nombre</th>
                <th className="p-3 text-left text-sm font-medium text-[#4B5563]">Cargo</th>
                <th className="p-3 text-left text-sm font-medium text-[#4B5563]">Estado</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-t border-[#D1D5DB]">
                <td className="p-3">Juan Pérez</td>
                <td className="p-3">Carpintero</td>
                <td className="p-3"><span className="px-2 py-1 bg-[#32C3A2] text-white text-xs rounded-full">Activo</span></td>
              </tr>
              <tr className="border-t border-[#D1D5DB]">
                <td className="p-3">María García</td>
                <td className="p-3">Diseñadora</td>
                <td className="p-3"><span className="px-2 py-1 bg-[#32C3A2] text-white text-xs rounded-full">Activo</span></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default WorkersPage;