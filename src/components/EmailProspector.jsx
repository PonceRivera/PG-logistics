import React, { useState } from 'react';
import { Sparkles, Send, Copy, Check, Building2, Truck, RefreshCw, Mail, User, FileText } from 'lucide-react';

export default function EmailProspector() {
  const [companyName, setCompanyName] = useState('');
  const [contactName, setContactName] = useState('');
  const [email, setEmail] = useState('');
  const [companyType, setCompanyType] = useState('fletera');
  const [notes, setNotes] = useState('');

  const [generatedSubject, setGeneratedSubject] = useState('');
  const [generatedBody, setGeneratedBody] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  // History of sent/generated emails
  const [history, setHistory] = useState([]);

  const generateEmail = async () => {
    if (!companyName.trim() || !email.trim()) {
      setError('Ingresa al menos el nombre de la empresa y el correo.');
      return;
    }
    setError('');
    setGeneratedSubject('');
    setGeneratedBody('');
    setLoading(true);

    try {
      const res = await fetch('/api/generate-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ companyName, contactName, email, companyType, notes }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error al generar');
      setGeneratedSubject(data.subject || '');
      setGeneratedBody(data.body || '');
    } catch (err) {
      setError('Error al generar el correo: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const regenerate = () => {
    generateEmail();
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(generatedBody);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
      const ta = document.createElement('textarea');
      ta.value = generatedBody;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const openInGmail = () => {
    const subject = encodeURIComponent(generatedSubject);
    const body = encodeURIComponent(generatedBody);
    window.open(`mailto:${email}?subject=${subject}&body=${body}`, '_blank');

    // Add to history
    setHistory(prev => [{
      company: companyName,
      email,
      type: companyType,
      date: new Date().toLocaleString('es-MX'),
      subject: generatedSubject,
    }, ...prev]);
  };

  return (
    <div className="page-content">
      <div className="section-header" style={{ marginTop: '0.5rem' }}>
        <p className="section-overline">Herramienta de prospección</p>
        <h1 className="section-title">Generador de Emails con IA</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: '0.25rem' }}>
          La IA redacta correos personalizados y persuasivos para cada empresa. Tú solo revisas y envías.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', alignItems: 'start' }}>

        {/* LEFT: Form */}
        <div className="card">
          <div className="card-header">
            <div>
              <p className="card-title">Datos del prospecto</p>
              <p className="card-subtitle">Llena los datos y la IA redactará el correo perfecto.</p>
            </div>
          </div>
          <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>

            {/* Type Selector */}
            <div>
              <label className="form-label">Tipo de empresa</label>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button
                  type="button"
                  className={`btn ${companyType === 'fletera' ? 'btn-primary' : 'btn-ghost'}`}
                  style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem' }}
                  onClick={() => setCompanyType('fletera')}
                >
                  <Truck size={14} /> Fletera (Proveedor)
                </button>
                <button
                  type="button"
                  className={`btn ${companyType === 'cliente' ? 'btn-primary' : 'btn-ghost'}`}
                  style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem' }}
                  onClick={() => setCompanyType('cliente')}
                >
                  <Building2 size={14} /> Cliente (Fábrica)
                </button>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Nombre de la empresa *</label>
              <input type="text" className="form-control" placeholder="Ej. Trayecto, Nemak, Whirlpool..."
                value={companyName} onChange={e => setCompanyName(e.target.value)} />
            </div>

            <div className="form-group">
              <label className="form-label">Nombre del contacto (opcional)</label>
              <input type="text" className="form-control" placeholder="Ej. Lic. Mario Garza"
                value={contactName} onChange={e => setContactName(e.target.value)} />
            </div>

            <div className="form-group">
              <label className="form-label">Correo electrónico *</label>
              <input type="email" className="form-control" placeholder="ventas@empresa.com"
                value={email} onChange={e => setEmail(e.target.value)} />
            </div>

            <div className="form-group">
              <label className="form-label">Notas adicionales (opcional)</label>
              <textarea className="form-control" rows={2} placeholder="Ej. Manejan rutas Monterrey-CDMX, tienen 30 cajas secas..."
                value={notes} onChange={e => setNotes(e.target.value)} />
            </div>

            {error && (
              <div style={{ color: 'var(--danger)', fontSize: '0.8rem', background: 'var(--danger-bg, rgba(239,68,68,0.1))', padding: '0.5rem 0.75rem', borderRadius: 'var(--radius-sm)' }}>
                {error}
              </div>
            )}

            <button className="btn btn-primary" onClick={generateEmail} disabled={loading}
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', width: '100%', padding: '0.65rem' }}>
              {loading ? (
                <><RefreshCw size={15} className="spin" /> Generando con IA...</>
              ) : (
                <><Sparkles size={15} /> Generar Email con IA</>
              )}
            </button>
          </div>
        </div>

        {/* RIGHT: Preview */}
        <div className="card">
          <div className="card-header">
            <div>
              <p className="card-title">Vista previa del correo</p>
              <p className="card-subtitle">Revisa, edita si quieres, y envía.</p>
            </div>
          </div>
          <div style={{ padding: '1.25rem' }}>
            {!generatedBody && !loading && (
              <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--text-tertiary)' }}>
                <Mail size={40} style={{ opacity: 0.3, marginBottom: '0.75rem' }} />
                <p style={{ fontSize: '0.85rem' }}>Llena los datos del prospecto y haz clic en "Generar Email con IA"</p>
              </div>
            )}

            {loading && (
              <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--primary)' }}>
                <RefreshCw size={32} className="spin" style={{ marginBottom: '0.75rem' }} />
                <p style={{ fontSize: '0.85rem' }}>La IA está redactando tu correo...</p>
              </div>
            )}

            {generatedBody && !loading && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {/* To */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.82rem' }}>
                  <span style={{ color: 'var(--text-tertiary)', fontWeight: 500 }}>Para:</span>
                  <span style={{ color: 'var(--primary)' }}>{email}</span>
                </div>

                {/* Subject */}
                <div>
                  <label className="form-label" style={{ fontSize: '0.72rem' }}>Asunto:</label>
                  <input type="text" className="form-control" value={generatedSubject}
                    onChange={e => setGeneratedSubject(e.target.value)} style={{ fontWeight: 600 }} />
                </div>

                {/* Body */}
                <div>
                  <label className="form-label" style={{ fontSize: '0.72rem' }}>Cuerpo:</label>
                  <textarea className="form-control" rows={12} value={generatedBody}
                    onChange={e => setGeneratedBody(e.target.value)}
                    style={{ fontSize: '0.82rem', lineHeight: '1.6', fontFamily: 'inherit' }} />
                </div>

                {/* Actions */}
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  <button className="btn btn-primary" onClick={openInGmail}
                    style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem' }}>
                    <Send size={14} /> Enviar con Gmail
                  </button>
                  <button className="btn btn-ghost" onClick={copyToClipboard}
                    style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    {copied ? <><Check size={14} /> Copiado!</> : <><Copy size={14} /> Copiar</>}
                  </button>
                  <button className="btn btn-ghost" onClick={regenerate}
                    style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <RefreshCw size={14} /> Regenerar
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* History */}
      {history.length > 0 && (
        <div className="card" style={{ marginTop: '1.5rem' }}>
          <div className="card-header">
            <div>
              <p className="card-title">Correos enviados en esta sesión</p>
              <p className="card-subtitle">Registro de los correos que has mandado hoy.</p>
            </div>
          </div>
          <div className="table-wrap">
            <table className="clean-table">
              <thead>
                <tr>
                  <th>Empresa</th>
                  <th>Correo</th>
                  <th>Tipo</th>
                  <th>Asunto</th>
                  <th>Fecha</th>
                </tr>
              </thead>
              <tbody>
                {history.map((h, i) => (
                  <tr key={i}>
                    <td><strong>{h.company}</strong></td>
                    <td style={{ fontSize: '0.8rem' }}>{h.email}</td>
                    <td><span className={`badge ${h.type === 'fletera' ? 'badge-transit' : 'badge-confirmed'}`}>
                      {h.type === 'fletera' ? 'Fletera' : 'Cliente'}
                    </span></td>
                    <td style={{ fontSize: '0.8rem' }}>{h.subject}</td>
                    <td style={{ fontSize: '0.78rem', color: 'var(--text-tertiary)' }}>{h.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        .spin { animation: spin 1s linear infinite; }
      `}</style>
    </div>
  );
}
