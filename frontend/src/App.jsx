import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardLayout from './components/layout/DashboardLayout';
import DashboardPage from './pages/DashboardPage';
import MaterialsPage from './pages/MaterialsPage';
import ProductsPage from './pages/ProductsPage';
import WorkersPage from './pages/WorkersPage';
import ProcessesPage from './pages/ProcessesPage';
import MarketplacePage from './pages/MarketplacePage';
import CompanyPage from './pages/CompanyPage';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/dashboard" element={<DashboardLayout />}>
            <Route index element={<DashboardPage />} />
            <Route path="materials" element={<MaterialsPage />} />
            <Route path="products" element={<ProductsPage />} />
            <Route path="workers" element={<WorkersPage />} />
            <Route path="processes" element={<ProcessesPage />} />
            <Route path="marketplace" element={<MarketplacePage />} />
            <Route path="company" element={<CompanyPage />} />
          </Route>
        </Routes>
      </div>
    </Router>
  );
}

export default App;