import React from 'react';
import { useAuthStore } from '../../store/authStore';
import Button from '../ui/Button';
import Input from '../ui/Input';
import { Link } from 'react-router-dom';

const RegisterForm = () => {
  const { formData, setFormData, loading, register } = useAuthStore();

  const handleSubmit = async (e) => {
    e.preventDefault();
    await register();
  };

  const handleChange = (e) => {
    setFormData(e.target.name, e.target.value);
  };

  const companyTypeOptions = [
    { value: '', label: 'Seleccionar tipo' },
    { value: 'textil', label: 'Textil' },
    { value: 'madera', label: 'Madera' },
    { value: 'cuero', label: 'Cuero' },
    { value: 'alimentos', label: 'Alimentos' }
  ];

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F5F7FA] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl w-full mx-auto flex flex-col lg:flex-row rounded-2xl overflow-hidden shadow-2xl">
        <div className="w-full lg:w-2/5 bg-gradient-to-br from-[#111A3B] to-[#2D4E7A] p-8 text-white flex flex-col justify-center">
          <div className="text-center lg:text-left">
            <h1 className="text-3xl font-bold mb-4">Únete a MateriaLab</h1>
            <p className="text-lg opacity-90 mb-8">
              Conecta tu empresa artesanal con el mundo y descubre nuevas oportunidades 
              para mostrar y vender tus productos únicos.
            </p>
          </div>
          
          <div className="space-y-6">
            <div className="flex items-start">
              <div className="bg-white bg-opacity-20 p-2 rounded-full mr-4 flex-shrink-0">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path>
                </svg>
              </div>
              <div>
                <h3 className="font-semibold">Exposición Global</h3>
                <p className="opacity-80 text-sm">Llega a clientes de todo el mundo interesados en productos artesanales.</p>
              </div>
            </div>
            
            <div className="flex items-start">
              <div className="bg-white bg-opacity-20 p-2 rounded-full mr-4 flex-shrink-0">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
                </svg>
              </div>
              <div>
                <h3 className="font-semibold">Comunidad Activa</h3>
                <p className="opacity-80 text-sm">Forma parte de una red de artesanos que valoran la calidad.</p>
              </div>
            </div>
            
            <div className="flex items-start">
              <div className="bg-white bg-opacity-20 p-2 rounded-full mr-4 flex-shrink-0">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
                </svg>
              </div>
              <div>
                <h3 className="font-semibold">Estadísticas Detalladas</h3>
                <p className="opacity-80 text-sm">Accede a análisis que te ayudarán a hacer crecer tu negocio.</p>
              </div>
            </div>
          </div>
        </div>

        <div className="w-full lg:w-3/5 bg-white p-8 flex items-center justify-center">
          <div className="w-full max-w-md">
            <div className="text-center">
              <img
                alt="MateriaLab"
                src="/Logo.png"
                className="mx-auto h-16 w-auto"
              />
              <h2 className="mt-6 text-2xl font-bold tracking-tight text-[#1E1E1E]">
                Registrar tu empresa
              </h2>
              <p className="mt-2 text-sm text-[#4B5563]">
                Crea tu cuenta para comenzar
              </p>
            </div>

            <div className="mt-8">
              <form onSubmit={handleSubmit} className="space-y-6">
                <Input
                  label="Nombre de la Empresa"
                  id="companyName"
                  name="companyName"
                  type="text"
                  required
                  value={formData.companyName}
                  onChange={handleChange}
                  placeholder="Mi Empresa S.A."
                />

                <div className="space-y-1">
                  <label className="block text-sm font-medium text-[#1E1E1E]">
                    Tipo de Empresa
                  </label>
                  <select
                    className="w-full px-3 py-2 border border-[#D1D5DB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#209E7F] focus:border-transparent"
                    id="companyType"
                    name="companyType"
                    required
                    value={formData.companyType}
                    onChange={handleChange}
                  >
                    {companyTypeOptions.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                <Input
                  label="Correo electrónico"
                  id="email"
                  name="email"
                  type="email"
                  required
                  autoComplete="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="tu@empresa.com"
                />

                <Input
                  label="Contraseña"
                  id="password"
                  name="password"
                  type="password"
                  required
                  autoComplete="new-password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                />

                <Button
                  type="submit"
                  loading={loading}
                  className="w-full"
                >
                  Registrar empresa
                </Button>
              </form>

              <p className="mt-8 text-center text-sm text-[#4B5563]">
                ¿Ya tienes cuenta?{' '}
                <Link to="/login" className="font-semibold text-[#209E7F] hover:text-[#32C3A2]">
                  Iniciar sesión
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterForm;