import React from 'react';
import { Truck, LogOut } from 'lucide-react';

export default function Navbar({ activeMode, setActiveMode, activeTab, setActiveTab, user, onSignOut }) {

  const clientTabs = [
    { id: 'inicio', label: 'Inicio' },
    { id: 'cotizar', label: 'Cotizar' },
    { id: 'rastreo', label: 'Rastreo' },
    { id: 'cobertura', label: 'Cobertura' },
  ];

  const adminTabs = [
    { id: 'admin-dashboard', label: 'Operaciones' },
    { id: 'admin-carriers', label: 'Transportistas' },
  ];

  const tabs = activeMode === 'client' ? clientTabs : (user ? adminTabs : []);

  return (
    <header className="navbar">
      <div className="brand-logo" onClick={() => { setActiveMode('client'); setActiveTab('inicio'); }}>
        <div className="brand-mark">
          <Truck size={16} strokeWidth={2.5} />
        </div>
        <span className="brand-name">GP Logistics</span>
      </div>

      <nav className="nav-center">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            className={`nav-tab ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </nav>

      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <div className="mode-switch">
          <button
            className={`mode-switch-btn ${activeMode === 'client' ? 'active' : ''}`}
            onClick={() => setActiveMode('client')}
          >
            Cliente
          </button>
          <button
            className={`mode-switch-btn ${activeMode === 'admin' ? 'active' : ''}`}
            onClick={() => setActiveMode('admin')}
          >
            Admin
          </button>
        </div>

        {user && activeMode === 'admin' && (
          <button
            className="btn btn-ghost btn-sm"
            onClick={onSignOut}
            title="Cerrar sesión"
          >
            <LogOut size={15} />
          </button>
        )}
      </div>
    </header>
  );
}
