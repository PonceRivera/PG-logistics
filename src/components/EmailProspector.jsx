import React, { useState, useEffect, useRef } from 'react';
import { Sparkles, Send, Copy, Check, Building2, Truck, RefreshCw, Mail, User, FileText, Upload, Play, Pause, Trash2 } from 'lucide-react';
import * as XLSX from 'xlsx';

export default function EmailProspector() {
  // Manual Generation State
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

  const [history, setHistory] = useState([]);

  // Campaign Queue State
  const [campaignQueue, setCampaignQueue] = useState(() => {
    const saved = localStorage.getItem('gpl_campaign_queue');
    return saved ? JSON.parse(saved) : [];
  });
  const [isCampaignRunning, setIsCampaignRunning] = useState(false);
  const [timeUntilNext, setTimeUntilNext] = useState(0);
  const [campaignLog, setCampaignLog] = useState([]);

  const fleteraInputRef = React.useRef(null);
  const clienteInputRef = React.useRef(null);
  const followupInputRef = React.useRef(null);

  const timerRef = useRef(null);

  // Sync queue to localstorage
  useEffect(() => {
    localStorage.setItem('gpl_campaign_queue', JSON.stringify(campaignQueue));
  }, [campaignQueue]);

  // Campaign Timer Logic
  useEffect(() => {
    if (isCampaignRunning && campaignQueue.length > 0) {
      if (timeUntilNext <= 0) {
        // Time to send!
        sendNextInQueue();
      } else {
        timerRef.current = setTimeout(() => {
          setTimeUntilNext(prev => prev - 1);
        }, 1000);
      }
    } else if (isCampaignRunning && campaignQueue.length === 0) {
      setIsCampaignRunning(false);
    }
    return () => clearTimeout(timerRef.current);
  }, [isCampaignRunning, timeUntilNext, campaignQueue]);

  const sendNextInQueue = async () => {
    if (campaignQueue.length === 0) return;
    const prospect = campaignQueue[0];
    
    // Default wait time between emails: 5 minutes (300 seconds)
    // To avoid spam limits. Using 15 seconds for testing if you want, but 300 is safe.
    const waitTime = 300; 

    try {
      addLog(`Procesando a: ${prospect.companyName} (${prospect.email})`, 'info');
      
      const res = await fetch('/api/send-campaign-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(prospect),
      });
      
      const data = await res.json();
      
      if (!res.ok) throw new Error(data.error || 'Error del servidor');

      addLog(`✅ Enviado exitosamente a ${prospect.email} (Asunto: ${data.subject})`, 'success');
      
      // Remove from queue
      setCampaignQueue(prev => prev.slice(1));
      
      // Reset timer
      setTimeUntilNext(waitTime);
    } catch (err) {
      addLog(`❌ Falló envío a ${prospect.companyName}: ${err.message}`, 'error');
      // Pausar campaña en caso de error para que el usuario revise
      setIsCampaignRunning(false);
    }
  };

  const addLog = (msg, type) => {
    setCampaignLog(prev => [{ time: new Date().toLocaleTimeString(), msg, type }, ...prev].slice(0, 50));
  };

  const toggleCampaign = () => {
    if (!isCampaignRunning && timeUntilNext === 0) {
      setTimeUntilNext(1); // Arrancar casi inmediatamente el primero
    }
    setIsCampaignRunning(!isCampaignRunning);
  };

  const clearQueue = () => {
    if(window.confirm('¿Seguro que deseas vaciar toda la cola de correos?')) {
      setCampaignQueue([]);
      setIsCampaignRunning(false);
    }
  };

  const handleExcelUpload = (e, uploadType) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const bstr = evt.target.result;
        const wb = XLSX.read(bstr, { type: 'binary' });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const data = XLSX.utils.sheet_to_json(ws);

        const newQueue = [];
        const headers = Object.keys(data[0] || {});
        
        // Buscar columnas de forma flexible (por coincidencia parcial)
        const findCol = (row, ...keywords) => {
          for (const key of Object.keys(row)) {
            const lower = key.toLowerCase();
            if (keywords.some(kw => lower.includes(kw))) return row[key];
          }
          return '';
        };

        data.forEach(row => {
          const name = findCol(row, 'empresa', 'company', 'nombre de la empresa');
          const mail = findCol(row, 'correo', 'email', 'e-mail');
          let rawEmail = String(mail).split('/')[0].trim();

          if (name && rawEmail && rawEmail.includes('@') && !rawEmail.includes('contacto via')) {
            newQueue.push({
              companyName: name,
              contactName: findCol(row, 'contacto', 'contact'),
              email: rawEmail,
              companyType: uploadType,
              notes: findCol(row, 'tipo de equipo', 'tipo de carga', 'sector', 'industria', 'servicio', 'notas'),
            });
          }
        });

        setCampaignQueue(prev => [...prev, ...newQueue]);
        addLog(`📂 Cargados ${newQueue.length} ${uploadType === 'fletera' ? 'fleteras' : 'clientes'} desde Excel.`, 'info');
      } catch (err) {
        alert('Error al leer el Excel. Verifica el formato.');
      }
    };
    reader.readAsBinaryString(file);
    e.target.value = '';
  };

  // --- Funciones para Generación Manual (Individual) ---
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

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(generatedBody);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
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
    setHistory(prev => [{ company: companyName, email, type: companyType, date: new Date().toLocaleString('es-MX'), subject: generatedSubject }, ...prev]);
  };

  const formatTime = (sec) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${s < 10 ? '0'+s : s}`;
  };

  return (
    <div className="page-content">
      <div className="section-header" style={{ marginTop: '0.5rem' }}>
        <p className="section-overline">Herramienta de prospección y automatización</p>
        <h1 className="section-title">Generador de Emails y Campañas</h1>
      </div>

      {/* CAMPAIGN QUEUE SECTION (NUEVO) */}
      <div className="card" style={{ marginBottom: '1.5rem', border: isCampaignRunning ? '2px solid var(--primary)' : '1px solid var(--border)' }}>
        <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <p className="card-title">Campaña de Correos Automática (Drip Campaign)</p>
            <p className="card-subtitle">Sube tu Excel. Se enviará 1 correo generado por IA cada 5 minutos usando tu propio correo SMTP.</p>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            <label className="btn btn-ghost" style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Truck size={14} /> Subir Fleteras
              <input ref={fleteraInputRef} type="file" accept=".xlsx, .xls, .csv" onChange={(e) => handleExcelUpload(e, 'fletera')} style={{ display: 'none' }} />
            </label>
            <label className="btn btn-ghost" style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Building2 size={14} /> Subir Clientes
              <input ref={clienteInputRef} type="file" accept=".xlsx, .xls, .csv" onChange={(e) => handleExcelUpload(e, 'cliente')} style={{ display: 'none' }} />
            </label>
            <label className="btn btn-ghost" style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#60a5fa' }}>
              <RefreshCw size={14} /> Subir Seguimiento
              <input ref={followupInputRef} type="file" accept=".xlsx, .xls, .csv" onChange={(e) => handleExcelUpload(e, 'cliente_followup')} style={{ display: 'none' }} />
            </label>
            {campaignQueue.length > 0 && (
              <button 
                className={`btn ${isCampaignRunning ? 'btn-danger' : 'btn-primary'}`} 
                onClick={toggleCampaign}
                style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', width: '130px', justifyContent: 'center' }}
              >
                {isCampaignRunning ? <><Pause size={16} /> Pausar</> : <><Play size={16} /> Iniciar</>}
              </button>
            )}
          </div>
        </div>
        
        <div style={{ padding: '1.25rem', display: 'flex', gap: '1.5rem' }}>
          {/* Cola de Envíos */}
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <span style={{ fontWeight: 600, fontSize: '0.85rem' }}>Cola de Envíos ({campaignQueue.length})</span>
              {campaignQueue.length > 0 && (
                <button onClick={clearQueue} style={{ background: 'none', border: 'none', color: 'var(--danger)', fontSize: '0.75rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                  <Trash2 size={12}/> Vaciar
                </button>
              )}
            </div>
            
            <div style={{ background: 'var(--bg-main)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', height: '200px', overflowY: 'auto' }}>
              {campaignQueue.length === 0 ? (
                <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-tertiary)', fontSize: '0.85rem' }}>
                  No hay contactos en cola. Sube un archivo Excel.
                </div>
              ) : (
                <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                  {campaignQueue.map((c, i) => (
                    <li key={i} style={{ padding: '0.5rem 1rem', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem' }}>
                      <div>
                        <strong>{c.companyName}</strong><br/>
                        <span style={{ color: 'var(--text-tertiary)' }}>{c.email}</span>
                      </div>
                      {i === 0 && isCampaignRunning && (
                        <div style={{ textAlign: 'right', color: 'var(--primary)' }}>
                          <span className="spin" style={{ display: 'inline-block', marginRight: '5px' }}>⏳</span>
                          Enviando en {formatTime(timeUntilNext)}
                        </div>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          {/* Registro de Actividad (Log) */}
          <div style={{ flex: 1 }}>
            <span style={{ fontWeight: 600, fontSize: '0.85rem', display: 'block', marginBottom: '0.5rem' }}>Registro de Actividad</span>
            <div style={{ background: '#000', color: '#0f0', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', height: '200px', overflowY: 'auto', padding: '0.75rem', fontSize: '0.75rem', fontFamily: 'monospace' }}>
              {campaignLog.length === 0 ? (
                <span style={{ color: '#555' }}>Esperando actividad...</span>
              ) : (
                campaignLog.map((log, i) => (
                  <div key={i} style={{ marginBottom: '0.4rem', color: log.type === 'error' ? '#f44' : log.type === 'info' ? '#aaa' : '#0f0' }}>
                    <span style={{ color: '#888' }}>[{log.time}]</span> {log.msg}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>


      {/* MANUAL GENERATOR */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', alignItems: 'start' }}>
        {/* LEFT: Form */}
        <div className="card">
          <div className="card-header">
            <div>
              <p className="card-title">Redacción Manual</p>
              <p className="card-subtitle">Redacta un correo único para un prospecto específico.</p>
            </div>
          </div>
          <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            <div>
              <label className="form-label">Tipo de empresa</label>
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                <button type="button" className={`btn ${companyType === 'fletera' ? 'btn-primary' : 'btn-ghost'}`} onClick={() => setCompanyType('fletera')} style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', fontSize: '0.75rem' }}>
                  <Truck size={14} /> Fletera
                </button>
                <button type="button" className={`btn ${companyType === 'cliente' ? 'btn-primary' : 'btn-ghost'}`} onClick={() => setCompanyType('cliente')} style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', fontSize: '0.75rem' }}>
                  <Building2 size={14} /> Cliente
                </button>
                <button type="button" className={`btn ${companyType === 'cliente_followup' ? 'btn-primary' : 'btn-ghost'}`} onClick={() => setCompanyType('cliente_followup')} style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', fontSize: '0.75rem' }}>
                  <RefreshCw size={14} /> Seguimiento
                </button>
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Nombre de la empresa *</label>
              <input type="text" className="form-control" value={companyName} onChange={e => setCompanyName(e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">Correo electrónico *</label>
              <input type="email" className="form-control" value={email} onChange={e => setEmail(e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">Notas / Contacto</label>
              <textarea className="form-control" rows={2} value={notes} onChange={e => setNotes(e.target.value)} />
            </div>
            {error && <div style={{ color: 'var(--danger)', fontSize: '0.8rem', padding: '0.5rem', background: 'rgba(239,68,68,0.1)', borderRadius: '4px' }}>{error}</div>}
            <button className="btn btn-primary" onClick={generateEmail} disabled={loading} style={{ width: '100%' }}>
              {loading ? <><RefreshCw size={15} className="spin" style={{ display: 'inline', marginRight: '5px' }}/> Generando...</> : <><Sparkles size={15} style={{ display: 'inline', marginRight: '5px' }}/> Generar Borrador</>}
            </button>
          </div>
        </div>

        {/* RIGHT: Preview */}
        <div className="card">
          <div className="card-header">
            <div>
              <p className="card-title">Vista previa</p>
            </div>
          </div>
          <div style={{ padding: '1.25rem' }}>
            {!generatedBody && !loading && (
              <div style={{ textAlign: 'center', padding: '2rem 1rem', color: 'var(--text-tertiary)' }}>
                <Mail size={32} style={{ opacity: 0.3, marginBottom: '0.5rem' }} />
                <p style={{ fontSize: '0.85rem' }}>Redacta un correo manual</p>
              </div>
            )}
            {loading && (
              <div style={{ textAlign: 'center', padding: '2rem 1rem', color: 'var(--primary)' }}>
                <RefreshCw size={24} className="spin" style={{ marginBottom: '0.5rem' }} />
                <p style={{ fontSize: '0.85rem' }}>Redactando...</p>
              </div>
            )}
            {generatedBody && !loading && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.82rem' }}>
                  <span style={{ color: 'var(--text-tertiary)', fontWeight: 500 }}>Para:</span><span style={{ color: 'var(--primary)' }}>{email}</span>
                </div>
                <div>
                  <input type="text" className="form-control" value={generatedSubject} onChange={e => setGeneratedSubject(e.target.value)} style={{ fontWeight: 600, fontSize: '0.8rem' }} />
                </div>
                <div>
                  <textarea className="form-control" rows={10} value={generatedBody} onChange={e => setGeneratedBody(e.target.value)} style={{ fontSize: '0.82rem', lineHeight: '1.6', fontFamily: 'inherit' }} />
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button className="btn btn-primary" onClick={openInGmail} style={{ flex: 1 }}><Send size={14} style={{ display: 'inline', marginRight: '4px' }}/> Enviar con Gmail</button>
                  <button className="btn btn-ghost" onClick={copyToClipboard}>
                    {copied ? <Check size={14} /> : <Copy size={14} />}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        .spin { animation: spin 1s linear infinite; }
      `}</style>
    </div>
  );
}
