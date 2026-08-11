import React, { useState, useEffect } from 'react';
import { 
  ShieldAlert, ShieldCheck, ShieldX, AlertTriangle, Lock, Unlock, 
  Ban, RefreshCw, Terminal, CheckCircle
} from 'lucide-react';
import { fetchSecurityEvents, fetchBlockedIps, blockIp, unblockIp, recordSecurityEvent } from '../lib/database';

export default function SecurityDashboard() {
  const [securityEvents, setSecurityEvents] = useState([]);
  const [blockedIps, setBlockedIps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newBlockIp, setNewBlockIp] = useState('');
  const [newBlockReason, setNewBlockReason] = useState('');
  const [autoRefresh, setAutoRefresh] = useState(30);

  const loadData = async () => {
    setLoading(true);
    try {
      const [eventsData, ipsData] = await Promise.all([
        fetchSecurityEvents(),
        fetchBlockedIps()
      ]);
      setSecurityEvents(eventsData);
      setBlockedIps(ipsData);
    } catch (err) {
      console.error('Error cargando datos de seguridad:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setAutoRefresh(prev => {
        if (prev <= 1) {
          loadData();
          return 30;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleBlockIpSubmit = async (e) => {
    e.preventDefault();
    if (!newBlockIp) return;
    await blockIp(newBlockIp.trim(), newBlockReason.trim() || 'Bloqueo manual por administrador');
    setNewBlockIp('');
    setNewBlockReason('');
    loadData();
  };

  const handleUnblock = async (ip) => {
    await unblockIp(ip);
    loadData();
  };

  const handleSimulateAttack = async () => {
    await recordSecurityEvent({
      eventType: 'scan_detected',
      ipAddress: '185.220.101.4',
      details: { targetPath: '/wp-admin/setup-config.php', userAgent: 'Sqlmap/1.5#stable' },
      severity: 'high'
    });
    loadData();
  };

  // Status calculation
  const criticalCount = securityEvents.filter(e => e.severity === 'critical' || e.severity === 'high').length;
  let statusBg = 'rgba(34, 197, 94, 0.06)';
  let statusBorder = 'rgba(34, 197, 94, 0.25)';
  let statusColor = '#22c55e';
  let statusTitle = 'SISTEMA PROTEGIDO — SIN AMENAZAS CRÍTICAS';
  let StatusIcon = ShieldCheck;

  if (criticalCount > 5) {
    statusBg = 'rgba(239, 68, 68, 0.08)';
    statusBorder = 'rgba(239, 68, 68, 0.4)';
    statusColor = '#ef4444';
    statusTitle = 'ALERTA ROJA — ACTIVIDAD SOSPECHOSA O INTENTOS DE ACCESO DETECTADOS';
    StatusIcon = ShieldX;
  } else if (criticalCount > 0) {
    statusBg = 'rgba(245, 158, 11, 0.08)';
    statusBorder = 'rgba(245, 158, 11, 0.3)';
    statusColor = '#f59e0b';
    statusTitle = 'ADVERTENCIA — ESCANEOS MITIGADOS Y REGISTRADOS';
    StatusIcon = ShieldAlert;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', width: '100%' }}>
      
      {/* Top Banner Status */}
      <div className="dash-header" style={{ background: statusBg, borderColor: statusBorder }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
          <StatusIcon size={32} color={statusColor} />
          <div>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: statusColor, margin: 0, letterSpacing: '-0.01em' }}>
              {statusTitle}
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', marginTop: '0.2rem' }}>
              Firewall activo | Escaneo de endpoints en ejecución | Rate limiting automático habilitado.
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <button
            onClick={handleSimulateAttack}
            style={{
              background: 'var(--bg-surface)',
              border: '1px solid var(--border)',
              color: 'var(--text-secondary)',
              padding: '0.45rem 0.8rem',
              borderRadius: 'var(--radius-md)',
              fontSize: '0.78rem',
              cursor: 'pointer'
            }}
          >
            Prueba de Alerta (Simular)
          </button>
          <button
            onClick={() => { setAutoRefresh(30); loadData(); }}
            className="btn btn-primary"
            style={{
              padding: '0.45rem 0.9rem',
              fontSize: '0.8rem',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              cursor: 'pointer'
            }}
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            {autoRefresh}s
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="dash-kpi-grid">
        <div className="dash-kpi-card">
          <div>
            <p style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-tertiary)', fontWeight: 600 }}>Amenazas Detectadas</p>
            <span className="dash-kpi-val" style={{ color: '#ffffff' }}>
              {securityEvents.length}
            </span>
          </div>
          <div className="dash-kpi-icon" style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', color: '#ef4444' }}>
            <AlertTriangle size={22} />
          </div>
        </div>

        <div className="dash-kpi-card">
          <div>
            <p style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-tertiary)', fontWeight: 600 }}>IPs Bloqueadas</p>
            <span className="dash-kpi-val" style={{ color: '#f59e0b' }}>
              {blockedIps.length}
            </span>
          </div>
          <div className="dash-kpi-icon" style={{ background: 'rgba(245, 158, 11, 0.1)', border: '1px solid rgba(245, 158, 11, 0.2)', color: '#f59e0b' }}>
            <Ban size={22} />
          </div>
        </div>

        <div className="dash-kpi-card">
          <div>
            <p style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-tertiary)', fontWeight: 600 }}>Protección de API</p>
            <span className="dash-kpi-val" style={{ color: '#22c55e', fontSize: '1.4rem' }}>
              100% ACTIVA
            </span>
          </div>
          <div className="dash-kpi-icon" style={{ background: 'rgba(34, 197, 94, 0.1)', border: '1px solid rgba(34, 197, 94, 0.2)', color: '#22c55e' }}>
            <Lock size={22} />
          </div>
        </div>
      </div>

      {/* Main Grid: IP Blacklist & Threat Feed */}
      <div className="dash-main-grid">
        {/* Left Column: Blacklist & Block IP */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          {/* Form to Manual Block IP */}
          <div className="dash-panel">
            <h3 className="dash-panel-title">
              <Ban size={16} color="#ef4444" /> Bloquear Dirección IP
            </h3>

            <form onSubmit={handleBlockIpSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div>
                <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.3rem' }}>
                  Dirección IP
                </label>
                <input
                  type="text"
                  placeholder="Ej: 192.168.1.100"
                  value={newBlockIp}
                  onChange={(e) => setNewBlockIp(e.target.value)}
                  required
                  style={{
                    width: '100%',
                    background: 'var(--bg-surface)',
                    border: '1px solid var(--border)',
                    color: '#fff',
                    fontSize: '0.8rem',
                    padding: '0.5rem 0.75rem',
                    borderRadius: 'var(--radius-md)',
                    fontFamily: 'monospace',
                    outline: 'none'
                  }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.3rem' }}>
                  Motivo del bloqueo
                </label>
                <input
                  type="text"
                  placeholder="Ej: Fuerza bruta / Escaneo"
                  value={newBlockReason}
                  onChange={(e) => setNewBlockReason(e.target.value)}
                  style={{
                    width: '100%',
                    background: 'var(--bg-surface)',
                    border: '1px solid var(--border)',
                    color: '#fff',
                    fontSize: '0.8rem',
                    padding: '0.5rem 0.75rem',
                    borderRadius: 'var(--radius-md)',
                    outline: 'none'
                  }}
                />
              </div>

              <button
                type="submit"
                style={{
                  background: '#ef4444',
                  color: '#fff',
                  border: 'none',
                  padding: '0.6rem 1rem',
                  borderRadius: 'var(--radius-md)',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.4rem',
                  marginTop: '0.25rem'
                }}
              >
                <Lock size={14} /> Bloquear IP Inmediatamente
              </button>
            </form>
          </div>

          {/* List of Blocked IPs */}
          <div className="dash-panel">
            <h3 className="dash-panel-title">
              <Lock size={16} color="#f59e0b" /> Lista Negra de IPs ({blockedIps.length})
            </h3>

            <div className="dash-list" style={{ maxHeight: '300px' }}>
              {blockedIps.length === 0 ? (
                <p style={{ color: 'var(--text-tertiary)', fontSize: '0.8rem', textAlign: 'center', padding: '1.5rem 0' }}>
                  No hay IPs en la lista negra.
                </p>
              ) : (
                blockedIps.map(item => (
                  <div
                    key={item.id || item.ip_address}
                    style={{
                      background: 'var(--bg-surface)',
                      border: '1px solid var(--border)',
                      padding: '0.65rem 0.85rem',
                      borderRadius: 'var(--radius-md)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      fontSize: '0.8rem'
                    }}
                  >
                    <div>
                      <span style={{ color: '#ef4444', fontFamily: 'monospace', fontWeight: 700, display: 'block' }}>
                        {item.ip_address}
                      </span>
                      <span style={{ color: 'var(--text-tertiary)', fontSize: '0.72rem', display: 'block' }}>
                        {item.reason || 'Sin razón'}
                      </span>
                    </div>

                    <button
                      onClick={() => handleUnblock(item.ip_address)}
                      style={{
                        background: 'var(--bg-elevated)',
                        border: '1px solid var(--border)',
                        color: 'var(--text-secondary)',
                        padding: '0.3rem 0.5rem',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center'
                      }}
                      title="Desbloquear IP"
                    >
                      <Unlock size={14} />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>

        {/* Right Column: Security Incident Stream */}
        <div className="dash-panel">
          <h3 className="dash-panel-title">
            <Terminal size={16} color="#22c55e" /> Registro de Amenazas e Incidentes
          </h3>

          <div className="dash-list" style={{ maxHeight: '540px' }}>
            {securityEvents.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '3rem 0', color: 'var(--text-tertiary)', fontSize: '0.85rem' }}>
                <CheckCircle size={32} color="#22c55e" style={{ margin: '0 auto 0.5rem', opacity: 0.6 }} />
                No se han registrado amenazas o accesos indebidos. Tu sistema está limpio.
              </div>
            ) : (
              securityEvents.map((ev, idx) => {
                let badgeBg = 'rgba(96, 165, 250, 0.1)';
                let badgeColor = '#60a5fa';
                let badgeBorder = 'rgba(96, 165, 250, 0.2)';

                if (ev.severity === 'medium') {
                  badgeBg = 'rgba(245, 158, 11, 0.1)';
                  badgeColor = '#f59e0b';
                  badgeBorder = 'rgba(245, 158, 11, 0.2)';
                } else if (ev.severity === 'high' || ev.severity === 'critical') {
                  badgeBg = 'rgba(239, 68, 68, 0.1)';
                  badgeColor = '#ef4444';
                  badgeBorder = 'rgba(239, 68, 68, 0.3)';
                }

                return (
                  <div key={ev.id || idx} className="dash-item">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span className="dash-badge" style={{
                          background: badgeBg,
                          color: badgeColor,
                          border: `1px solid ${badgeBorder}`
                        }}>
                          {ev.severity || 'low'}
                        </span>
                        <span style={{ color: '#fff', fontSize: '0.82rem', fontWeight: 600 }}>
                          {ev.event_type}
                        </span>
                      </div>

                      <span style={{ color: 'var(--text-tertiary)', fontSize: '0.72rem', fontFamily: 'monospace' }}>
                        {new Date(ev.created_at).toLocaleString()}
                      </span>
                    </div>

                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                      IP de Origen: <strong style={{ color: '#ef4444', fontFamily: 'monospace' }}>{ev.ip_address}</strong>
                    </div>

                    {ev.details && (
                      <div className="dash-json-box">
                        {JSON.stringify(ev.details, null, 2)}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
