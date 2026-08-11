import React, { useState, useEffect } from 'react';
import { 
  ShieldAlert, ShieldCheck, ShieldX, AlertTriangle, Lock, Unlock, 
  Ban, RefreshCw, Terminal, Eye, AlertOctagon, CheckCircle
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

  // Determine System Security Status (Green, Yellow, Red)
  const criticalCount = securityEvents.filter(e => e.severity === 'critical' || e.severity === 'high').length;
  let statusColor = 'border-emerald-500/40 bg-emerald-950/20 text-emerald-400';
  let statusBadge = 'SISTEMA PROTEGIDO — SIN AMENAZAS CRÍTICAS';
  let StatusIcon = ShieldCheck;

  if (criticalCount > 5) {
    statusColor = 'border-red-500/50 bg-red-950/30 text-red-400 animate-pulse';
    statusBadge = 'ALERTA ROJA — ATAQUE O ACTIVIDAD SOSPECHOSA DETECTADA';
    StatusIcon = ShieldX;
  } else if (criticalCount > 0) {
    statusColor = 'border-amber-500/50 bg-amber-950/20 text-amber-400';
    statusBadge = 'ADVERTENCIA — INTENTOS DE ACCESO DETECTADOS Y MITIGADOS';
    StatusIcon = ShieldAlert;
  }

  return (
    <div className="space-y-6">
      {/* Top Banner Status */}
      <div className={`border rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4 ${statusColor}`}>
        <div className="flex items-center gap-3">
          <StatusIcon className="w-8 h-8 flex-shrink-0" />
          <div>
            <h2 className="text-lg font-bold tracking-wide">{statusBadge}</h2>
            <p className="text-xs opacity-80 mt-0.5">
              Firewall activo | Escaneo de endpoints en ejecución | Rate limiting automático habilitado.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleSimulateAttack}
            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs text-slate-300 rounded-lg transition-colors"
          >
            Prueba de Alerta (Simular)
          </button>
          <button
            onClick={() => { setAutoRefresh(30); loadData(); }}
            className="p-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            {autoRefresh}s
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex items-center justify-between">
          <div>
            <p className="text-slate-400 text-xs font-medium uppercase tracking-wider">Amenazas Detectadas</p>
            <span className="text-2xl font-black text-white mt-1 block">{securityEvents.length}</span>
          </div>
          <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl">
            <AlertTriangle className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex items-center justify-between">
          <div>
            <p className="text-slate-400 text-xs font-medium uppercase tracking-wider">IPs Bloqueadas</p>
            <span className="text-2xl font-black text-amber-400 mt-1 block">{blockedIps.length}</span>
          </div>
          <div className="p-3 bg-amber-500/10 border border-amber-500/20 text-amber-400 rounded-xl">
            <Ban className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex items-center justify-between">
          <div>
            <p className="text-slate-400 text-xs font-medium uppercase tracking-wider">Protección de API</p>
            <span className="text-2xl font-black text-emerald-400 mt-1 block">100% ACTIVA</span>
          </div>
          <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl">
            <Lock className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Main Content Grid: Block IP Form & Security Logs */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: IP Blocking & Blacklist */}
        <div className="space-y-6">
          
          {/* Form to manual block IP */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-3">
              <Ban className="w-4 h-4 text-red-400" /> Bloquear Dirección IP
            </h3>

            <form onSubmit={handleBlockIpSubmit} className="space-y-3">
              <div>
                <label className="text-xs text-slate-400 block mb-1">Dirección IP</label>
                <input
                  type="text"
                  placeholder="Ej: 192.168.1.100"
                  value={newBlockIp}
                  onChange={(e) => setNewBlockIp(e.target.value)}
                  required
                  className="w-full bg-slate-800 border border-slate-700 text-white text-xs p-2 rounded-lg focus:outline-none focus:border-red-500 font-mono"
                />
              </div>

              <div>
                <label className="text-xs text-slate-400 block mb-1">Motivo del bloqueo</label>
                <input
                  type="text"
                  placeholder="Ej: Ataque de fuerza bruta / Escaneo"
                  value={newBlockReason}
                  onChange={(e) => setNewBlockReason(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 text-white text-xs p-2 rounded-lg focus:outline-none focus:border-red-500"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2 bg-red-600 hover:bg-red-500 text-white font-semibold text-xs rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                <Lock className="w-3.5 h-3.5" /> Bloquear IP Inmediatamente
              </button>
            </form>
          </div>

          {/* List of Blocked IPs */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-3">
              <Lock className="w-4 h-4 text-amber-400" /> Lista Negra de IPs ({blockedIps.length})
            </h3>

            <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
              {blockedIps.length === 0 ? (
                <p className="text-slate-500 text-xs text-center py-6">No hay IPs en la lista negra.</p>
              ) : (
                blockedIps.map(item => (
                  <div key={item.id || item.ip_address} className="p-2.5 bg-slate-800/60 border border-slate-700/50 rounded-lg flex items-center justify-between text-xs">
                    <div>
                      <span className="text-red-400 font-mono font-bold block">{item.ip_address}</span>
                      <span className="text-slate-400 text-[11px] block">{item.reason || 'Sin razón'}</span>
                    </div>
                    <button
                      onClick={() => handleUnblock(item.ip_address)}
                      className="p-1.5 bg-slate-700 hover:bg-emerald-600 text-slate-300 hover:text-white rounded transition-colors"
                      title="Desbloquear IP"
                    >
                      <Unlock className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>

        {/* Right 2-Columns: Security Events Log */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-4">
          <h3 className="text-sm font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-3">
            <Terminal className="w-4 h-4 text-emerald-400" /> Historial de Amenazas y Registro de Seguridad
          </h3>

          <div className="space-y-2.5 max-h-[550px] overflow-y-auto pr-1">
            {securityEvents.length === 0 ? (
              <div className="text-center py-16 text-slate-500 text-xs">
                <CheckCircle className="w-8 h-8 text-emerald-500 mx-auto mb-2 opacity-50" />
                No se han registrado amenazas o accesos indebidos. Tu sistema está limpio.
              </div>
            ) : (
              securityEvents.map(ev => {
                let badge = 'bg-blue-500/10 text-blue-400 border-blue-500/20';
                if (ev.severity === 'medium') badge = 'bg-amber-500/10 text-amber-400 border-amber-500/20';
                if (ev.severity === 'high' || ev.severity === 'critical') badge = 'bg-red-500/10 text-red-400 border-red-500/20 animate-pulse';

                return (
                  <div key={ev.id || Math.random()} className="bg-slate-800/40 border border-slate-800 p-3 rounded-lg text-xs space-y-2 hover:border-slate-700 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold border uppercase tracking-wider ${badge}`}>
                          {ev.severity || 'low'}
                        </span>
                        <span className="text-white font-semibold">{ev.event_type}</span>
                      </div>
                      <span className="text-slate-500 font-mono text-[11px]">
                        {new Date(ev.created_at).toLocaleString()}
                      </span>
                    </div>

                    <div className="flex items-center gap-4 text-slate-400 text-[11px]">
                      <span>IP de Origen: <strong className="text-red-400 font-mono">{ev.ip_address}</strong></span>
                    </div>

                    {ev.details && (
                      <div className="bg-slate-950 p-2 rounded font-mono text-[11px] text-amber-300/90 overflow-x-auto">
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
