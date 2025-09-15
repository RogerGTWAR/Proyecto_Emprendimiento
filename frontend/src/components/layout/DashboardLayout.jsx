import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation, Outlet } from 'react-router-dom';

const DashboardLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isHoveringLogo, setIsHoveringLogo] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    navigate('/login');
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
  };

  useEffect(() => {
    setIsSidebarOpen(false);
  }, [location.pathname]);

  const menuItems = [
    { 
      name: 'Dashboard', 
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
          <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 12 8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
        </svg>
      ), 
      path: '/dashboard' 
    },
    { 
      name: 'Materiales', 
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
          <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
        </svg>
      ), 
      path: '/dashboard/materials' 
    },
    { 
      name: 'Productos', 
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
        </svg>
      ), 
      path: '/dashboard/products' 
    },
    { 
      name: 'Trabajadores', 
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
          <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
        </svg>
      ), 
      path: '/dashboard/workers' 
    },
    { 
      name: 'Procesos', 
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
          <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
        </svg>
      ), 
      path: '/dashboard/processes' 
    },
    { 
      name: 'Marketplace', 
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
          <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 21v-7.5a.75.75 0 01.75-.75h3a.75.75 0 01.75.75V21m-4.5 0H2.36m11.14 0H18m0 0h3.64m-1.39 0V9.349m-16.5 11.65V9.35m0 0a3.001 3.001 0 003.75-.615A2.993 2.993 0 009.75 9.75c.896 0 1.7-.393 2.25-1.016a2.993 2.993 0 002.25 1.016c.896 0 1.7-.393 2.25-1.016a3.001 3.001 0 003.75.614m-16.5 0a3.004 3.004 0 01-.621-4.72L4.318 3.44A1.5 1.5 0 015.378 3h13.243a1.5 1.5 0 011.06.44l1.19 1.189a3 3 0 01-.621 4.72m-13.5 8.65h3.75a.75.75 0 00.75-.75V13.5a.75.75 0 00-.75-.75H6.75a.75.75 0 00-.75.75v3.75c0 .415.336.75.75.75z" />
        </svg>
      ), 
      path: '/dashboard/marketplace' 
    },
    { 
      name: 'Mi Empresa', 
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
          <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h1.5m-1.5 3h1.5m-1.5 3h1.5m3-6H15m-1.5 3H15m-1.5 3H15M9 21v-3.375c0-.621.504-1.125 1.125-1.125h3.75c.621 0 1.125.504 1.125 1.125V21" />
        </svg>
      ), 
      path: '/dashboard/company' 
    },
  ];

  return (
    <div className="flex h-screen bg-[#F5F7FA]">
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        ></div>
      )}

      <aside className={`fixed md:relative z-40 flex flex-col ${isCollapsed ? 'w-16' : 'w-64'} bg-white text-[#1E1E1E] transform transition-all duration-300 ease-in-out h-full ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'} shadow-lg md:shadow-none border-r border-[#D1D5DB]`}>
        <div className="flex items-center justify-between p-4 border-b border-[#D1D5DB]">
          {!isCollapsed ? (
            <Link to="/dashboard" className="flex items-center space-x-2">
              <img 
                src="/Logo.png" 
                alt="MateriaLab Logo" 
                className="h-8 w-8 object-contain"
              />
              <span className="text-xl font-bold text-[#111A3B]">MateriaLab</span>
            </Link>
          ) : (
            <div 
              className="flex justify-center w-full"
              onMouseEnter={() => setIsHoveringLogo(true)}
              onMouseLeave={() => setIsHoveringLogo(false)}
            >
              {isHoveringLogo ? (
                <button 
                  onClick={toggleCollapse}
                  className="p-2 rounded-md bg-[#F5F7FA] text-[#4B5563] hover:text-[#209E7F] transition-colors"
                  title="Expandir menú"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              ) : (
                <div className="h-8 w-8 bg-[#209E7F] rounded-md flex items-center justify-center text-white font-bold">ML</div>
              )}
            </div>
          )}
          
          <button 
            className="md:hidden p-1 rounded-md text-[#4B5563] hover:bg-[#F5F7FA]"
            onClick={() => setIsSidebarOpen(false)}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <nav className="flex-1 overflow-y-auto py-4">
          <ul className="space-y-1 px-2">
            {menuItems.map((item) => (
              <li key={item.name}>
                <Link 
                  to={item.path} 
                  className={`flex items-center p-3 rounded-lg transition-colors duration-200 ${isCollapsed ? 'justify-center' : ''} ${
                    location.pathname === item.path 
                      ? 'bg-[#209E7F] text-white' 
                      : 'text-[#4B5563] hover:text-[#209E7F] hover:bg-[#F5F7FA]'
                  }`}
                  title={isCollapsed ? item.name : ''}
                >
                  <span className={`w-6 h-6 ${location.pathname === item.path ? 'text-white' : ''}`}>
                    {item.icon}
                  </span>
                  {!isCollapsed && (
                    <span className={`ml-3 font-medium ${location.pathname === item.path ? 'text-white' : ''}`}>
                      {item.name}
                    </span>
                  )}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="p-4 border-t border-[#D1D5DB]">
          <button 
            onClick={handleLogout}
            className={`flex items-center w-full p-3 text-[#4B5563] hover:text-[#209E7F] hover:bg-[#F5F7FA] rounded-lg transition-colors duration-200 ${isCollapsed ? 'justify-center' : ''}`}
            title={isCollapsed ? "Cerrar Sesión" : ""}
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 9V5.25A2.25 2.25 0 0 1 10.5 3h6a2.25 2.25 0 0 1 2.25 2.25v13.5A2.25 2.25 0 0 1 16.5 21h-6a2.25 2.25 0 0 1-2.25-2.25V15m-3 0-3-3m0 0 3-3m-3 3H15" />
            </svg>
            {!isCollapsed && <span className="ml-3 font-medium">Cerrar Sesión</span>}
          </button>
        </div>
      </aside>

      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white border-b border-[#D1D5DB]">
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center">
              <button
                onClick={toggleSidebar}
                className="md:hidden p-2 rounded-lg text-[#111A3B] hover:bg-[#F5F7FA]"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
              <h1 className="ml-4 text-xl font-semibold text-[#1E1E1E]">
                {location.pathname === '/dashboard' && 'Dashboard'}
                {location.pathname === '/dashboard/materials' && 'Materiales'}
                {location.pathname === '/dashboard/products' && 'Productos'}
                {location.pathname === '/dashboard/workers' && 'Trabajadores'}
                {location.pathname === '/dashboard/processes' && 'Procesos'}
                {location.pathname === '/dashboard/marketplace' && 'Marketplace'}
                {location.pathname === '/dashboard/company' && 'Mi Empresa'}
              </h1>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3 bg-[#F5F7FA] p-2 rounded-lg">
                <div className="w-8 h-8 bg-[#209E7F] rounded-full flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-white">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h1.5m-1.5 3h1.5m-1.5 3h1.5m3-6H15m-1.5 3H15m-1.5 3H15M9 21v-3.375c0-.621.504-1.125 1.125-1.125h3.75c.621 0 1.125.504 1.125 1.125V21" />
                  </svg>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-[#1E1E1E]">Mi Empresa</p>
                  <p className="text-xs text-[#4B5563]">Plan Premium</p>
                </div>
              </div>
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto bg-white">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default DashboardLayout;