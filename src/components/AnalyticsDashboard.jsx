import React, { useState, useEffect } from 'react';
import { 
  Users, Activity, Globe, Eye, MousePointer, 
  Clock, RefreshCw, AlertCircle, Laptop, Smartphone, Search, Filter
} from 'lucide-react';
import { fetchAnalyticsEvents } from '../lib/database';

export default function AnalyticsDashboard() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [autoRefreshCount, setAutoRefreshCount] = useState(30);
  const [selectedSession, setSelectedSession] = useState(null);
  const [filterType, setFilterType] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const loadAnalytics = async () => {
    setLoading(true);
    try {
      const data = await fetchAnalyticsEvents();
      setEvents(data);
      setLastUpdated(new Date());
    } catch (err) {
      console.error('Error cargando analíticas:', err);
    } finally {
      setLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    loadAnalytics();
  }, []);

  // 30-Second Auto Refresh Timer
  useEffect(() => {
    const timer = setInterval(() => {
      setAutoRefreshCount(prev => {
        if (prev <= 1) {
          loadAnalytics();
          return 30;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Derived Metrics
  const totalEvents = events.length;
  const uniqueSessions = new Set(events.map(e => e.session_id)).size;
  const pageViews = events.filter(e => e.event_type === 'pageview').length;
  const formSubmits = events.filter(e => e.event_type === 'form_submit').length;
  const clickEvents = events.filter(e => e.event_type === 'click').length;

  // Active Sessions in last 5 minutes
  const fiveMinAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();
  const activeNowCount = new Set(
    events.filter(e => e.created_at >= fiveMinAgo).map(e => e.session_id)
  ).size;

  // Group events by session for session explorer
  const sessionsMap = {};
  events.forEach(ev => {
    if (!sessionsMap[ev.session_id]) {
      sessionsMap[ev.session_id] = {
        sessionId: ev.session_id,
        ip: ev.ip_address,
        country: ev.country,
        city: ev.city,
        device: ev.device,
        browser: ev.browser,
        startTime: ev.created_at,
        lastTime: ev.created_at,
        eventCount: 0,
        eventsList: []
      };
    }
    sessionsMap[ev.session_id].eventsList.push(ev);
    sessionsMap[ev.session_id].eventCount += 1;
    if (ev.created_at > sessionsMap[ev.session_id].lastTime) {
      sessionsMap[ev.session_id].lastTime = ev.created_at;
    }
  });

  const sessionList = Object.values(sessionsMap).sort((a, b) => new Date(b.lastTime) - new Date(a.lastTime));

  const filteredEvents = events.filter(ev => {
    const matchesType = filterType === 'all' || ev.event_type === filterType;
    const matchesSearch = !searchQuery || 
      ev.session_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ev.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ev.event_type.toLowerCase().includes(searchQuery.toLowerCase()) ||
      JSON.stringify(ev.event_data).toLowerCase().includes(searchQuery.toLowerCase());
    return matchesType && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Top Header Controls */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Activity className="w-5 h-5 text-emerald-400 animate-pulse" /> Monitor de Visitantes en Tiempo Real
          </h2>
          <p className="text-slate-400 text-xs mt-1">
            Rastreo en vivo de navegación, clics, formularios e intención del usuario.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-700 flex items-center gap-2 text-xs text-slate-300">
            <Clock className="w-3.5 h-3.5 text-emerald-400" />
            <span>Auto-actualización en: <strong className="text-emerald-400 font-mono text-sm">{autoRefreshCount}s</strong></span>
          </div>
          <button
            onClick={() => { setAutoRefreshCount(30); loadAnalytics(); }}
            className="p-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg transition-colors flex items-center gap-1.5 text-xs font-semibold"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Actualizar
          </button>
        </div>
      </div>

      {/* KPI Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex items-center justify-between">
          <div>
            <p className="text-slate-400 text-xs font-medium uppercase tracking-wider">Activos Ahora</p>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-black text-emerald-400">{activeNowCount}</span>
              <span className="text-xs text-emerald-500 font-medium">usuarios en los últimos 5m</span>
            </div>
          </div>
          <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl">
            <Users className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex items-center justify-between">
          <div>
            <p className="text-slate-400 text-xs font-medium uppercase tracking-wider">Sesiones Únicas</p>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-black text-white">{uniqueSessions}</span>
              <span className="text-xs text-slate-400">totales registradas</span>
            </div>
          </div>
          <div className="p-3 bg-blue-500/10 border border-blue-500/20 text-blue-400 rounded-xl">
            <Globe className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex items-center justify-between">
          <div>
            <p className="text-slate-400 text-xs font-medium uppercase tracking-wider">Vistas de Página</p>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-black text-white">{pageViews}</span>
              <span className="text-xs text-slate-400">páginas cargadas</span>
            </div>
          </div>
          <div className="p-3 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 rounded-xl">
            <Eye className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex items-center justify-between">
          <div>
            <p className="text-slate-400 text-xs font-medium uppercase tracking-wider">Interacciones</p>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-black text-amber-400">{clickEvents + formSubmits}</span>
              <span className="text-xs text-slate-400">clics y envíos</span>
            </div>
          </div>
          <div className="p-3 bg-amber-500/10 border border-amber-500/20 text-amber-400 rounded-xl">
            <MousePointer className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Main Grid: Sessions List & Detailed Event Stream */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Active Sessions Overview */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-4">
          <h3 className="text-sm font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-3">
            <Users className="w-4 h-4 text-emerald-400" /> Sesiones de Visitantes ({sessionList.length})
          </h3>

          <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
            {sessionList.length === 0 ? (
              <p className="text-slate-500 text-xs text-center py-8">Esperando visitantes...</p>
            ) : (
              sessionList.map(sess => {
                const isSelected = selectedSession?.sessionId === sess.sessionId;
                return (
                  <div
                    key={sess.sessionId}
                    onClick={() => setSelectedSession(isSelected ? null : sess)}
                    className={`p-3 rounded-lg border text-xs cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-emerald-950/40 border-emerald-500/50 text-white'
                        : 'bg-slate-800/60 border-slate-700/50 hover:border-slate-600 text-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between font-mono text-[11px] mb-1">
                      <span className="text-emerald-400 font-semibold">{sess.sessionId.substring(0, 14)}...</span>
                      <span className="text-slate-500">{new Date(sess.lastTime).toLocaleTimeString()}</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-400 text-[11px]">
                      {sess.device === 'Mobile' ? <Smartphone className="w-3 h-3 text-amber-400" /> : <Laptop className="w-3 h-3 text-blue-400" />}
                      <span>{sess.city}, {sess.country}</span>
                      <span className="ml-auto bg-slate-700 px-1.5 py-0.5 rounded text-[10px] text-white">
                        {sess.eventCount} eventos
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right 2-Columns: Event Feed & Timeline */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Activity className="w-4 h-4 text-emerald-400" /> 
              {selectedSession ? `Timeline de Sesión: ${selectedSession.sessionId.substring(0, 12)}` : 'Feed de Eventos en Tiempo Real'}
            </h3>

            {selectedSession && (
              <button
                onClick={() => setSelectedSession(null)}
                className="text-xs text-emerald-400 hover:underline"
              >
                Ver todos los eventos
              </button>
            )}

            {/* Filter controls */}
            <div className="flex items-center gap-2">
              <div className="relative flex-1 sm:w-48">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                <input
                  type="text"
                  placeholder="Buscar IP, evento, texto..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 text-white text-xs pl-8 pr-3 py-1.5 rounded-lg focus:outline-none focus:border-emerald-500"
                />
              </div>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="bg-slate-800 border border-slate-700 text-slate-300 text-xs py-1.5 px-2 rounded-lg focus:outline-none focus:border-emerald-500"
              >
                <option value="all">Todos los eventos</option>
                <option value="pageview">Páginas vistas</option>
                <option value="click">Clics</option>
                <option value="form_submit">Formularios</option>
              </select>
            </div>
          </div>

          {/* Event Stream List */}
          <div className="space-y-2.5 max-h-[500px] overflow-y-auto pr-1">
            {(selectedSession ? selectedSession.eventsList : filteredEvents).length === 0 ? (
              <div className="text-center py-12 text-slate-500 text-xs">
                No se encontraron eventos con los filtros seleccionados.
              </div>
            ) : (
              (selectedSession ? selectedSession.eventsList : filteredEvents).map(ev => {
                const timeStr = new Date(ev.created_at).toLocaleTimeString();
                let badgeColor = 'bg-blue-500/10 text-blue-400 border-blue-500/20';
                if (ev.event_type === 'click') badgeColor = 'bg-amber-500/10 text-amber-400 border-amber-500/20';
                if (ev.event_type === 'form_submit') badgeColor = 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';

                return (
                  <div key={ev.id || Math.random()} className="bg-slate-800/40 border border-slate-800 p-3 rounded-lg text-xs space-y-1.5 hover:border-slate-700 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-semibold border uppercase tracking-wider ${badgeColor}`}>
                          {ev.event_type}
                        </span>
                        <span className="text-white font-medium">
                          {ev.event_type === 'pageview' && `Vio página: ${ev.event_data?.page || 'Inicio'}`}
                          {ev.event_type === 'click' && `Hizo clic en: "${ev.event_data?.target || 'Elemento'}"`}
                          {ev.event_type === 'form_submit' && `Envió formulario: ${ev.event_data?.form || 'Cotización'}`}
                          {ev.event_type === 'session_start' && `Inició sesión desde ${ev.referrer || 'Directo'}`}
                        </span>
                      </div>
                      <span className="text-slate-500 text-[11px] font-mono">{timeStr}</span>
                    </div>

                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-slate-400 pt-1 border-t border-slate-800/60">
                      <span>IP: <strong className="text-slate-300 font-mono">{ev.ip_address}</strong></span>
                      <span>Ubicación: <strong className="text-slate-300">{ev.city}, {ev.country}</strong></span>
                      <span>Dispositivo: <strong className="text-slate-300">{ev.device} ({ev.browser})</strong></span>
                    </div>

                    {/* Extra Event Data Details */}
                    {ev.event_data && Object.keys(ev.event_data).length > 0 && (
                      <div className="bg-slate-950 p-2 rounded text-[11px] font-mono text-emerald-300/90 overflow-x-auto">
                        {JSON.stringify(ev.event_data)}
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
