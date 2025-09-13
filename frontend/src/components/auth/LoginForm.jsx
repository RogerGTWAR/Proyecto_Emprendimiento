import React from 'react';
import { useAuthStore } from '../../store/authStore';
import Button from '../ui/Button';
import Input from '../ui/Input';
import { Link } from 'react-router-dom';

const LoginForm = () => {
  const { formData, setFormData, loading, login } = useAuthStore();

  const handleSubmit = async (e) => {
    e.preventDefault();
    await login();
  };

  const handleChange = (e) => {
    setFormData(e.target.name, e.target.value);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F5F7FA] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl w-full mx-auto flex flex-col lg:flex-row rounded-2xl overflow-hidden shadow-2xl">
        <div className="w-full lg:w-2/5 bg-gradient-to-br from-[#111A3B] to-[#2D4E7A] p-8 text-white flex flex-col justify-center">
          <div className="text-center lg:text-left">
            <h1 className="text-3xl font-bold mb-4">Bienvenido a MateriaLab</h1>
            <p className="text-lg opacity-90 mb-8">
              Accede a tu cuenta para gestionar tu empresa artesanal y conectar con clientes 
              que valoran productos auténticos y de calidad.
            </p>
          </div>
          
          <div className="space-y-6">
            <div className="flex items-start">
              <div className="bg-white bg-opacity-20 p-2 rounded-full mr-4 flex-shrink-0">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
                </svg>
              </div>
              <div>
                <h3 className="font-semibold">Acceso Seguro</h3>
                <p className="opacity-80 text-sm">Tus datos están protegidos con encriptación de última generación.</p>
              </div>
            </div>
            
            <div className="flex items-start">
              <div className="bg-white bg-opacity-20 p-2 rounded-full mr-4 flex-shrink-0">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
                </svg>
              </div>
              <div>
                <h3 className="font-semibold">Panel de Control</h3>
                <p className="opacity-80 text-sm">Gestiona tus productos, pedidos y estadísticas desde un único lugar.</p>
              </div>
            </div>
            
            <div className="flex items-start">
              <div className="bg-white bg-opacity-20 p-2 rounded-full mr-4 flex-shrink-0">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z"></path>
                </svg>
              </div>
              <div>
                <h3 className="font-semibold">Soporte 24/7</h3>
                <p className="opacity-80 text-sm">Nuestro equipo está disponible para ayudarte cuando lo necesites.</p>
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
                Iniciar sesión
              </h2>
              <p className="mt-2 text-sm text-[#4B5563]">
                Ingresa a tu cuenta para comenzar
              </p>
            </div>

            <div className="mt-8">
              <form onSubmit={handleSubmit} className="space-y-6">
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
                  autoComplete="current-password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                />

                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <input
                      id="remember-me"
                      name="remember-me"
                      type="checkbox"
                      className="h-4 w-4 text-[#209E7F] focus:ring-[#209E7F] border-gray-300 rounded"
                    />
                    <label htmlFor="remember-me" className="ml-2 block text-sm text-[#1E1E1E]">
                      Recordarme
                    </label>
                  </div>

                  <div className="text-sm">
                    <a href="#" className="font-medium text-[#209E7F] hover:text-[#32C3A2]">
                      ¿Olvidaste tu contraseña?
                    </a>
                  </div>
                </div>

                <Button
                  type="submit"
                  loading={loading}
                  className="w-full"
                >
                  Iniciar sesión
                </Button>
              </form>

              <div className="mt-6">
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-[#D1D5DB]" />
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-white text-[#4B5563]">¿No tienes una cuenta?</span>
                  </div>
                </div>

                <div className="mt-4 text-center">
                  <Link to="/register" className="font-medium text-[#209E7F] hover:text-[#32C3A2]">
                    Regístrate ahora
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;