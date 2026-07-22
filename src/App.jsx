import React, { useState, useEffect, useCallback } from 'react';
import { AuthProvider, useAuth } from './lib/AuthContext';
import { fetchQuotes, fetchCarriers, createQuote, updateQuote as dbUpdateQuote, createCarrier } from './lib/database';
import Navbar from './components/Navbar';
import ClientPortal from './components/ClientPortal';
import AdminPortal from './components/AdminPortal';
import LegalPages from './components/LegalPages';
import LoginPage from './components/LoginPage';
import Footer from './components/Footer';
import Chatbot from './components/Chatbot';

function AppContent() {
  const { user, loading: authLoading, signOut } = useAuth();
  const [activeMode, setActiveMode] = useState(() => localStorage.getItem('gpl_mode') || 'client');
  const [activeTab, setActiveTab] = useState(() => localStorage.getItem('gpl_tab') || 'inicio');

  // Sync state to localStorage automatically when it changes
  useEffect(() => {
    localStorage.setItem('gpl_mode', activeMode);
  }, [activeMode]);

  useEffect(() => {
    localStorage.setItem('gpl_tab', activeTab);
  }, [activeTab]);

  const [quotes, setQuotes] = useState([]);
  const [carriers, setCarriers] = useState([]);
  const [dataLoading, setDataLoading] = useState(true);

  // Load data on mount and when user changes
  const loadData = useCallback(async () => {
    setDataLoading(true);
    try {
      const q = await fetchQuotes();
      setQuotes(q);
    } catch (err) {
      console.error('Error loading quotes:', err);
    }

    try {
      const c = await fetchCarriers();
      setCarriers(c);
    } catch (err) {
      // Carriers may fail for unauthenticated users (RLS), that's OK
      console.warn('Carriers not loaded (may need auth):', err.message);
    }

    setDataLoading(false);
  }, [user]);

  useEffect(() => {
    if (!authLoading) loadData();
  }, [authLoading, loadData]);

  // Handlers
  const handleNewQuote = async (quote) => {
    try {
      const created = await createQuote(quote);
      setQuotes(prev => [created, ...prev]);
      return created;
    } catch (err) {
      console.error('Error creating quote:', err);
      // Fallback: add locally
      setQuotes(prev => [quote, ...prev]);
      return quote;
    }
  };

  const handleUpdateQuote = async (quote) => {
    try {
      const updated = await dbUpdateQuote(quote);
      setQuotes(prev => prev.map(q => q.id === updated.id ? updated : q));
    } catch (err) {
      console.error('Error updating quote:', err);
      // Fallback: update locally
      setQuotes(prev => prev.map(q => q.id === quote.id ? quote : q));
    }
  };

  const handleAddCarrier = async (carrier) => {
    try {
      const created = await createCarrier(carrier);
      setCarriers(prev => [created, ...prev]);
    } catch (err) {
      console.error('Error creating carrier:', err);
      setCarriers(prev => [carrier, ...prev]);
    }
  };

  // When switching to admin, check auth
  const handleModeChange = (mode) => {
    setActiveMode(mode);
    if (mode === 'admin') {
      setActiveTab('admin-dashboard');
      // Reload data when entering admin (may need fresh carriers)
      loadData();
    } else {
      setActiveTab('inicio');
    }
  };

  // Show loading state
  if (authLoading) {
    return (
      <div className="app-container" style={{ alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ color: 'var(--text-tertiary)', fontSize: '0.85rem' }}>Cargando...</p>
      </div>
    );
  }

  // Admin mode requires login
  const showLogin = activeMode === 'admin' && !user;

  return (
    <div className="app-container">
      <Navbar
        activeMode={activeMode === 'legal' ? 'client' : activeMode}
        setActiveMode={handleModeChange}
        activeTab={activeTab}
        setActiveTab={(t) => {
          setActiveMode(t.startsWith('admin') ? 'admin' : 'client');
          setActiveTab(t);
        }}
        user={user}
        onSignOut={signOut}
      />

      {activeMode === 'client' && (
        <ClientPortal
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          quotes={quotes}
          onNewQuote={handleNewQuote}
        />
      )}

      {activeMode === 'admin' && showLogin && <LoginPage />}

      {activeMode === 'admin' && !showLogin && (
        <AdminPortal
          quotes={quotes}
          onUpdateQuote={handleUpdateQuote}
          carriers={carriers}
          onAddCarrier={handleAddCarrier}
          loading={dataLoading}
        />
      )}

      {activeMode === 'legal' && (
        <LegalPages activeTab={activeTab} />
      )}

      {(activeMode === 'client' || activeMode === 'legal') && <Chatbot />}

      <Footer setActiveTab={setActiveTab} setActiveMode={setActiveMode} />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
