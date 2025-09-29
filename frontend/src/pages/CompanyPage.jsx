import { useState } from 'react';
import CompanyForm from '../components/company/CompanyForm';

const CompanyPage = () => {
  const [empresa, setEmpresa] = useState({
    nombre: "",
    descripcion: "",
    direccion: "",
    telefono: "",
    email: "",
    logo: ""
  });

  const [mostrarFormulario, setMostrarFormulario] = useState(false);

  const handleSaveEmpresa = (datosActualizados) => {
    setEmpresa(datosActualizados);
    setMostrarFormulario(false);
  };

  const handleExport = () => {
    const dataStr = JSON.stringify(empresa, null, 2);
    const blob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "empresa.json";
    a.click();

    URL.revokeObjectURL(url);
  };

  const tieneInformacion = empresa.nombre || empresa.descripcion || empresa.direccion || empresa.telefono || empresa.email;

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="max-w-4xl mx-auto space-y-8"> 
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center space-x-4">
            {empresa.logo ? (
              <img
                src={empresa.logo}
                alt="Logo Empresa"
                className="w-16 h-16 rounded-full border object-cover"
              />
            ) : (
              <div className="w-16 h-16 rounded-full border border-dashed border-gray-300 flex items-center justify-center bg-gray-100">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
            )}
            <div>
              <h1 className="text-3xl font-bold text-gray-800 mb-2">
                {empresa.nombre || "Mi Empresa"}
              </h1>
              <p className="text-gray-600">
                {empresa.descripcion || "Completa la información de tu empresa"}
              </p>
            </div>
          </div>

          {tieneInformacion && (
            <button
              onClick={handleExport}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span>Exportar</span>
            </button>
          )}
        </div>
 
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-xl font-semibold mb-4">Información</h2>

          {tieneInformacion ? (
            <div>
              <ul className="text-gray-700 space-y-2">
                {empresa.direccion && (
                  <li><strong>Dirección:</strong> {empresa.direccion}</li>
                )}
                {empresa.telefono && (
                  <li><strong>Teléfono:</strong> {empresa.telefono}</li>
                )}
                {empresa.email && (
                  <li><strong>Email:</strong> {empresa.email}</li>
                )}
              </ul> 
              <div className="mt-6 pt-4 border-t border-gray-200">
                <button
                  onClick={() => setMostrarFormulario(true)}
                  className="flex items-center gap-2 text-blue-600 hover:text-blue-700 transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                  </svg>
                  <span>Editar información</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No hay información de la empresa
              </h3>
              <p className="text-gray-500 mb-4">
                Agrega la información de tu empresa para comenzar
              </p>
              <button
                onClick={() => setMostrarFormulario(true)}
                className="bg-[#3B6DB3] text-white px-6 py-3 rounded-lg flex items-center gap-2 hover:bg-[#2D5599] transition-colors mx-auto"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Agregar Información de la Empresa
              </button>
            </div>
          )}
        </div>
      </div>

      {mostrarFormulario && (
        <CompanyForm
          onClose={() => setMostrarFormulario(false)}
          onSubmit={handleSaveEmpresa}
          initialData={empresa}
          isEdit={tieneInformacion}
        />
      )}
    </div>
  );
};

export default CompanyPage;