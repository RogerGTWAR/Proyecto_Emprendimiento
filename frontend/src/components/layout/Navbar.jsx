import React from 'react';
import { Link } from 'react-router-dom';

const Navbar = () => {
  return (
    <nav className="bg-gradient-to-br from-blue-800 to-blue-900 border-gray-200 sticky top-0 z-50 shadow-lg">
      <div className="flex flex-wrap items-center justify-between max-w-screen-xl mx-auto p-4">
        <Link to="/" className="flex items-center space-x-3 rtl:space-x-reverse">
          <span className="self-center text-2xl font-semibold whitespace-nowrap text-white">MateriaLab</span>
        </Link>
        
        <div className="flex items-center md:order-2 space-x-1 md:space-x-2 rtl:space-x-reverse">
          <Link
            to="/login"
            className="text-white hover:bg-blue-700 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-4 py-2 md:px-5 md:py-2.5 focus:outline-none transition-colors duration-200"
          >
            Login
          </Link>
          <Link
            to="/register"
            className="text-white bg-blue-600 hover:bg-blue-700 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-4 py-2 md:px-5 md:py-2.5 focus:outline-none transition-colors duration-200"
          >
            Sign up
          </Link>
          
          <button className="inline-flex items-center p-2 w-10 h-10 justify-center text-sm text-white rounded-lg md:hidden hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-300 transition-colors duration-200">
            <span className="sr-only">Open main menu</span>
            <svg className="w-5 h-5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 17 14">
              <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M1 1h15M1 7h15M1 13h15"/>
            </svg>
          </button>
        </div>
        
        <div className="items-center justify-between hidden w-full md:flex md:w-auto md:order-1">
          <ul className="flex flex-col mt-4 font-medium md:flex-row md:mt-0 md:space-x-8 rtl:space-x-reverse">
            <li>
              <Link 
                to="/" 
                className="block py-2 px-3 text-white bg-blue-700 rounded md:bg-transparent md:text-white md:p-0 md:hover:text-blue-300 transition-colors duration-200" 
                aria-current="page"
              >
                Home
              </Link>
            </li>
            <li>
              <Link 
                to="#" 
                className="block py-2 px-3 text-white rounded hover:bg-blue-700 md:hover:bg-transparent md:hover:text-blue-300 md:p-0 transition-colors duration-200"
                onClick={(e) => e.preventDefault()}
              >
                About
              </Link>
            </li>
            <li>
              <Link 
                to="#" 
                className="block py-2 px-3 text-white rounded hover:bg-blue-700 md:hover:bg-transparent md:hover:text-blue-300 md:p-0 transition-colors duration-200"
                onClick={(e) => e.preventDefault()}
              >
                Contact
              </Link>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;