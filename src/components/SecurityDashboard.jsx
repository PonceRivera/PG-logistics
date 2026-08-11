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
      <div style={{
        background: statusBg,
        border: `1px solid ${statusBorder}`,
        borderRadius: 'var(--radius-lg)',
        padding: '1.25rem 1.5rem',
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '1rem'
      }}>
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
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '1rem'
      }}>
        <div style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-lg)',
          padding: '1.25rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div>
            <p style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-tertiary)', fontWeight: 600 }}>Amenazas Detectadas</p>
            <span style={{ fontSize: '1.8rem', fontWeight: 800, color: '#ffffff', marginTop: '0.2rem', display: 'block' }}>
              {securityEvents.length}
            </span>
          </div>
          <div style={{
            background: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid rgba(239, 68, 68, 0.2)',
            padding: '0.75rem',
            borderRadius: 'var(--radius-md)',
            color: '#ef4444'
          }}>
            <AlertTriangle size={22} />
          </div>
        </div>

        <div style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-lg)',
          padding: '1.25rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div>
            <p style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-tertiary)', fontWeight: 600 }}>IPs Bloqueadas</p>
            <span style={{ fontSize: '1.8rem', fontWeight: 800, color: '#f59e0b', marginTop: '0.2rem', display: 'block' }}>
              {blockedIps.length}
            </span>
          </div>
          <div style={{
            background: 'rgba(245, 158, 11, 0.1)',
            border: '1px solid rgba(245, 158, 11, 0.2)',
            padding: '0.75rem',
            borderRadius: 'var(--radius-md)',
            color: '#f59e0b'
          }}>
            <Ban size={22} />
          </div>
        </div>

        <div style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-lg)',
          padding: '1.25rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div>
            <p style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-tertiary)', fontWeight: 600 }}>Protección de API</p>
            <span style={{ fontSize: '1.4rem', fontWeight: 800, color: '#22c55e', marginTop: '0.2rem', display: 'block' }}>
              100% ACTIVA
            </span>
          </div>
          <div style={{
            background: 'rgba(34, 197, 94, 0.1)',
            border: '1px solid rgba(34, 197, 94, 0.2)',
            padding: '0.75rem',
            borderRadius: 'var(--radius-md)',
            color: '#22c55e'
          }}>
            <Lock size={22} />
          </div>
        </div>
      </div>

      {/* Main Grid: IP Blacklist & Threat Feed */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 2fr)',
        gap: '1.5rem',
        width: '100%'
      }}>
        {/* Left Column: Blacklist & Block IP */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          {/* Form to Manual Block IP */}
          <div style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-lg)',
            padding: '1.25rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.85rem'
          }}>
            <h3 style={{
              fontSize: '0.95rem',
              fontWeight: 600,
              color: '#fff',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              paddingBottom: '0.75rem',
              borderBottom: '1px solid var(--border)'
            }}>
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
          <div style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-lg)',
            padding: '1.25rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.85rem'
          }}>
            <h3 style={{
              fontSize: '0.95rem',
              fontWeight: 600,
              color: '#fff',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              paddingBottom: '0.75rem',
              borderBottom: '1px solid var(--border)'
            }}>
              <Lock size={16} color="#f59e0b" /> Lista Negra de IPs ({blockedIps.length})
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: '300px', overflowY: 'auto' }}>
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
        <div style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-lg)',
          padding: '1.25rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem'
        }}>
          <h3 style={{
            fontSize: '0.95rem',
            fontWeight: 600,
            color: '#fff',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            paddingBottom: '0.75rem',
            borderBottom: '1px solid var(--border)'
          }}>
            <Terminal size={16} color="#22c55e" /> Registro de Amenazas e Incidentes
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', maxHeight: '540px', overflowY: 'auto' }}>
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
                  <div
                    key={ev.id || idx}
                    style={{
                      background: 'var(--bg-surface)',
                      border: '1px solid var(--border)',
                      borderRadius: 'var(--radius-md)',
                      padding: '0.85rem',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.4rem'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span style={{
                          background: badgeBg,
                          color: badgeColor,
                          border: `1px solid ${badgeBorder}`,
                          padding: '0.1rem 0.45rem',
                          borderRadius: '4px',
                          fontSize: '0.65rem',
                          fontWeight: 700,
                          textTransform: 'uppercase'
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
                      <div style={{
                        background: '#090909',
                        border: '1px solid #1f1f1f',
                        padding: '0.5rem 0.75rem',
                        borderRadius: '4px',
                        fontSize: '0.72rem',
                        fontFamily: 'monospace',
                        color: '#f59e0b',
                        overflowX: 'auto',
                        marginTop: '0.2rem'
                      }}>
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
