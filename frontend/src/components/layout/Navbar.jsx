import React from 'react';
import { Link } from 'react-router-dom';
import { useNavbarStore } from '../../store/navbarStore';

const Navbar = () => {
  const { isMenuOpen, toggleMenu, closeMenu } = useNavbarStore();

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          
          <Link to="/" className="flex-shrink-0 flex items-center" onClick={closeMenu}>
            <img src="/Logo.png" alt="MateriaLab" className="h-8 w-auto mr-2" />
            <span className="text-2xl font-bold text-[#111A3B]">MateriaLab</span>
          </Link>

          <div className="hidden md:flex items-center space-x-8">
            <Link
              to="/"
              className="text-gray-700 hover:text-[#209E7F] font-medium transition-colors duration-200"
              onClick={closeMenu}
            >
              Inicio
            </Link>
            <Link
              to="#"
              className="text-gray-700 hover:text-[#209E7F] font-medium transition-colors duration-200"
              onClick={(e) => { e.preventDefault(); closeMenu(); }}
            >
              Marketplace
            </Link>
            <Link
              to="#"
              className="text-gray-700 hover:text-[#209E7F] font-medium transition-colors duration-200"
              onClick={(e) => { e.preventDefault(); closeMenu(); }}
            >
              Recursos
            </Link>
            <Link
              to="#"
              className="text-gray-700 hover:text-[#209E7F] font-medium transition-colors duration-200"
              onClick={(e) => { e.preventDefault(); closeMenu(); }}
            >
              Nosotros
            </Link>
            
            <div className="w-px h-6 bg-gray-300"></div>

            <div className="flex items-center space-x-4">
              <Link 
                to="/login" 
                className="text-[#111A3B] hover:text-[#209E7F] font-medium transition-colors duration-200"
                onClick={closeMenu}
              >
                Iniciar Sesión
              </Link>
              <Link 
                to="/register" 
                className="bg-[#209E7F] hover:bg-[#32C3A2] text-white px-5 py-2 rounded-lg font-medium transition-colors duration-200 shadow-md hover:shadow-lg"
                onClick={closeMenu}
              >
                Registrarse
              </Link>
            </div>
          </div>

          <div className="md:hidden">
            <button
              onClick={toggleMenu}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:text-[#209E7F] focus:outline-none focus:ring-2 focus:ring-inset focus:ring-[#209E7F]"
            >
              <span className="sr-only">Open main menu</span>
              {!isMenuOpen ? (
                <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              ) : (
                <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {isMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white border-t border-gray-200">
              <Link
                to="/"
                className="block px-3 py-2 text-gray-700 hover:text-[#209E7F] font-medium"
                onClick={closeMenu}
              >
                Inicio
              </Link>
              <Link
                to="#"
                className="block px-3 py-2 text-gray-700 hover:text-[#209E7F] font-medium"
                onClick={(e) => { e.preventDefault(); closeMenu(); }}
              >
                Marketplace
              </Link>
              <Link
                to="#"
                className="block px-3 py-2 text-gray-700 hover:text-[#209E7F] font-medium"
                onClick={(e) => { e.preventDefault(); closeMenu(); }}
              >
                Recursos
              </Link>
              <Link
                to="#"
                className="block px-3 py-2 text-gray-700 hover:text-[#209E7F] font-medium"
                onClick={(e) => { e.preventDefault(); closeMenu(); }}
              >
                Nosotros
              </Link>
              
              <div className="pt-4 pb-3 border-t border-gray-200">
                <Link
                  to="/login"
                  className="block px-3 py-2 text-[#111A3B] hover:text-[#209E7F] font-medium"
                  onClick={closeMenu}
                >
                  Iniciar Sesión
                </Link>
                <Link
                  to="/register"
                  className="block px-3 py-2 bg-[#209E7F] hover:bg-[#32C3A2] text-white rounded-lg mt-2 font-medium text-center transition-colors duration-200"
                  onClick={closeMenu}
                >
                  Registrarse
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;