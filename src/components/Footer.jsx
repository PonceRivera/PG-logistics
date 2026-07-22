import React from 'react';

export default function Footer({ setActiveTab, setActiveMode }) {
  const handleLegalClick = (tab) => {
    setActiveMode('legal');
    setActiveTab(tab);
    window.scrollTo(0, 0);
  };

  return (
    <footer className="footer">
      <div style={{ display: 'flex', justifyContent: 'center', gap: '1.5rem', flexWrap: 'wrap', marginBottom: '0.75rem' }}>
        <button className="footer-link" onClick={() => handleLegalClick('terminos')}>
          Términos y Condiciones
        </button>
        <button className="footer-link" onClick={() => handleLegalClick('privacidad')}>
          Aviso de Privacidad
        </button>
        <button className="footer-link" onClick={() => handleLegalClick('cookies')}>
          Política de Cookies
        </button>
        <button className="footer-link" onClick={() => handleLegalClick('deslinde')}>
          Deslinde de Responsabilidad
        </button>
      </div>
      <p>© {new Date().getFullYear()} Grupo Ponce Logistics · contacto@grupoponcelogistics.com</p>
    </footer>
  );
}
