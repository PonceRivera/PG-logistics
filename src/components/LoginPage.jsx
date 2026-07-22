import React, { useState } from 'react';
import { useAuth } from '../lib/AuthContext';
import { AlertCircle, LogIn } from 'lucide-react';

export default function LoginPage() {
  const { signIn, isConfigured } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const { error: err } = await signIn(email, password);
    if (err) {
      setError(err.message === 'Invalid login credentials'
        ? 'Correo o contraseña incorrectos.'
        : err.message);
    }

    setLoading(false);
  };

  return (
    <div className="page-content" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 'calc(100vh - 120px)' }}>
      <div style={{ width: '100%', maxWidth: '380px' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <p className="section-overline">Panel de administración</p>
          <h1 className="section-title" style={{ fontSize: '1.35rem' }}>
            Iniciar sesión
          </h1>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginTop: '0.35rem' }}>
            Accede a la mesa de control y operaciones de GP Logistics.
          </p>
        </div>

        {!isConfigured && (
          <div style={{ background: 'var(--warning-soft)', border: '1px solid rgba(234,179,8,0.2)', borderRadius: 'var(--radius-md)', padding: '0.75rem', marginBottom: '1rem', fontSize: '0.8rem', color: 'var(--warning)' }}>
            <strong>Supabase no configurado.</strong> Revisa tus variables de entorno en Vercel.
          </div>
        )}

        <form onSubmit={handleSubmit} className="card" style={{ padding: '1.5rem' }}>
          <div className="form-group">
            <label className="form-label">Correo electrónico</label>
            <input
              type="email"
              required
              className="form-control"
              placeholder="tu@correo.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Contraseña</label>
            <input
              type="password"
              required
              minLength={6}
              className="form-control"
              placeholder="Contraseña"
              value={password}
              onChange={e => setPassword(e.target.value)}
            />
          </div>

          {error && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', padding: '0.5rem 0.65rem', background: 'var(--danger-soft)', borderRadius: 'var(--radius-sm)', color: 'var(--danger)', fontSize: '0.78rem', marginBottom: '0.75rem' }}>
              <AlertCircle size={14} /> {error}
            </div>
          )}

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', marginTop: '0.25rem' }}
            disabled={loading}
          >
            {loading ? 'Accediendo...' : (
              <><LogIn size={15} /> Entrar</>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
