import React, { useState, useEffect } from 'react';
import { 
  Users, Activity, Globe, Eye, MousePointer, 
  Clock, RefreshCw, Laptop, Smartphone, Search, ChevronRight, CornerDownRight
} from 'lucide-react';
import { fetchAnalyticsEvents } from '../lib/database';

export default function AnalyticsDashboard() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [autoRefreshCount, setAutoRefreshCount] = useState(30);
  const [selectedSession, setSelectedSession] = useState(null);
  const [filterType, setFilterType] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const loadAnalytics = async () => {
    setLoading(true);
    try {
      const data = await fetchAnalyticsEvents();
      setEvents(data);
    } catch (err) {
      console.error('Error cargando analíticas:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAnalytics();
  }, []);

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

  // Metrics
  const uniqueSessions = new Set(events.map(e => e.session_id)).size;
  const pageViews = events.filter(e => e.event_type === 'pageview').length;
  const formSubmits = events.filter(e => e.event_type === 'form_submit').length;
  const clickEvents = events.filter(e => e.event_type === 'click').length;

  const fiveMinAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();
  const activeNowCount = new Set(
    events.filter(e => e.created_at >= fiveMinAgo).map(e => e.session_id)
  ).size;

  // Sessions map
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
      (ev.city && ev.city.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (ev.ip_address && ev.ip_address.includes(searchQuery)) ||
      ev.event_type.toLowerCase().includes(searchQuery.toLowerCase()) ||
      JSON.stringify(ev.event_data).toLowerCase().includes(searchQuery.toLowerCase());
    return matchesType && matchesSearch;
  });

  const activeEventsList = selectedSession ? selectedSession.eventsList : filteredEvents;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', width: '100%' }}>
      
      {/* Top Controls Header */}
      <div style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius-lg)',
        padding: '1.25rem 1.5rem',
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '1rem'
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <span style={{
              width: '10px', height: '10px', borderRadius: '50%',
              background: '#22c55e', boxShadow: '0 0 10px #22c55e',
              display: 'inline-block'
            }} />
            <h2 style={{ fontSize: '1.2rem', color: '#fff', margin: 0, fontWeight: 600 }}>
              Monitor de Visitantes en Tiempo Real
            </h2>
          </div>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', marginTop: '0.25rem' }}>
            Rastreo en vivo de navegación, clics, formularios e intención del usuario.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{
            background: 'var(--bg-surface)',
            border: '1px solid var(--border)',
            padding: '0.4rem 0.8rem',
            borderRadius: 'var(--radius-md)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            fontSize: '0.8rem',
            color: 'var(--text-secondary)'
          }}>
            <Clock size={14} color="#22c55e" />
            <span>Actualizando en: <strong style={{ color: '#22c55e', fontFamily: 'monospace' }}>{autoRefreshCount}s</strong></span>
          </div>

          <button
            onClick={() => { setAutoRefreshCount(30); loadAnalytics(); }}
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
            Actualizar
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '1rem'
      }}>
        {/* Card 1 */}
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
            <p style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-tertiary)', fontWeight: 600 }}>Activos Ahora</p>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem', marginTop: '0.3rem' }}>
              <span style={{ fontSize: '1.8rem', fontWeight: 800, color: '#22c55e' }}>{activeNowCount}</span>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>últimos 5m</span>
            </div>
          </div>
          <div style={{
            background: 'rgba(34, 197, 94, 0.1)',
            border: '1px solid rgba(34, 197, 94, 0.2)',
            padding: '0.75rem',
            borderRadius: 'var(--radius-md)',
            color: '#22c55e'
          }}>
            <Users size={22} />
          </div>
        </div>

        {/* Card 2 */}
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
            <p style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-tertiary)', fontWeight: 600 }}>Sesiones Únicas</p>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem', marginTop: '0.3rem' }}>
              <span style={{ fontSize: '1.8rem', fontWeight: 800, color: '#ffffff' }}>{uniqueSessions}</span>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>totales</span>
            </div>
          </div>
          <div style={{
            background: 'rgba(96, 165, 250, 0.1)',
            border: '1px solid rgba(96, 165, 250, 0.2)',
            padding: '0.75rem',
            borderRadius: 'var(--radius-md)',
            color: '#60a5fa'
          }}>
            <Globe size={22} />
          </div>
        </div>

        {/* Card 3 */}
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
            <p style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-tertiary)', fontWeight: 600 }}>Vistas de Página</p>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem', marginTop: '0.3rem' }}>
              <span style={{ fontSize: '1.8rem', fontWeight: 800, color: '#ffffff' }}>{pageViews}</span>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>cargas</span>
            </div>
          </div>
          <div style={{
            background: 'rgba(168, 85, 247, 0.1)',
            border: '1px solid rgba(168, 85, 247, 0.2)',
            padding: '0.75rem',
            borderRadius: 'var(--radius-md)',
            color: '#a855f7'
          }}>
            <Eye size={22} />
          </div>
        </div>

        {/* Card 4 */}
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
            <p style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-tertiary)', fontWeight: 600 }}>Interacciones</p>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem', marginTop: '0.3rem' }}>
              <span style={{ fontSize: '1.8rem', fontWeight: 800, color: '#f59e0b' }}>{clickEvents + formSubmits}</span>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>clics y envíos</span>
            </div>
          </div>
          <div style={{
            background: 'rgba(245, 158, 11, 0.1)',
            border: '1px solid rgba(245, 158, 11, 0.2)',
            padding: '0.75rem',
            borderRadius: 'var(--radius-md)',
            color: '#f59e0b'
          }}>
            <MousePointer size={22} />
          </div>
        </div>
      </div>

      {/* Main Grid: Sessions & Event Feed */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 2fr)',
        gap: '1.5rem',
        width: '100%'
      }}>
        {/* Left Column: Sessions List */}
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
            <Users size={16} color="#22c55e" /> Sesiones de Visitantes ({sessionList.length})
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: '520px', overflowY: 'auto' }}>
            {sessionList.length === 0 ? (
              <p style={{ color: 'var(--text-tertiary)', fontSize: '0.8rem', textAlign: 'center', padding: '2rem 0' }}>
                Esperando visitantes...
              </p>
            ) : (
              sessionList.map(sess => {
                const isSelected = selectedSession?.sessionId === sess.sessionId;
                return (
                  <div
                    key={sess.sessionId}
                    onClick={() => setSelectedSession(isSelected ? null : sess)}
                    style={{
                      padding: '0.85rem',
                      borderRadius: 'var(--radius-md)',
                      background: isSelected ? 'rgba(34, 197, 94, 0.08)' : 'var(--bg-surface)',
                      border: isSelected ? '1px solid #22c55e' : '1px solid var(--border)',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                      <span style={{ color: '#22c55e', fontFamily: 'monospace', fontSize: '0.75rem', fontWeight: 600 }}>
                        {sess.sessionId.substring(0, 16)}...
                      </span>
                      <span style={{ color: 'var(--text-tertiary)', fontSize: '0.7rem' }}>
                        {new Date(sess.lastTime).toLocaleTimeString()}
                      </span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                      {sess.device === 'Mobile' ? <Smartphone size={13} color="#f59e0b" /> : <Laptop size={13} color="#60a5fa" />}
                      <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {sess.city}, {sess.country}
                      </span>
                      <span style={{
                        marginLeft: 'auto',
                        background: 'var(--bg-elevated)',
                        padding: '0.15rem 0.4rem',
                        borderRadius: '4px',
                        fontSize: '0.68rem',
                        color: '#fff'
                      }}>
                        {sess.eventCount} evt
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column: Event Feed Stream */}
        <div style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-lg)',
          padding: '1.25rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem'
        }}>
          {/* Header & Filters */}
          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '0.75rem',
            paddingBottom: '0.75rem',
            borderBottom: '1px solid var(--border)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Activity size={16} color="#22c55e" />
              <h3 style={{ fontSize: '0.95rem', fontWeight: 600, color: '#fff', margin: 0 }}>
                {selectedSession ? `Timeline: ${selectedSession.sessionId.substring(0, 12)}` : 'Feed de Eventos en Tiempo Real'}
              </h3>
            </div>

            {selectedSession && (
              <button
                onClick={() => setSelectedSession(null)}
                style={{ background: 'none', border: 'none', color: '#22c55e', fontSize: '0.75rem', cursor: 'pointer', textDecoration: 'underline' }}
              >
                Ver todos los eventos
              </button>
            )}

            <div style={{ display: 'flex', items: 'center', gap: '0.5rem', marginLeft: 'auto' }}>
              <div style={{ position: 'relative' }}>
                <Search size={13} style={{ position: 'absolute', left: '8px', top: '9px', color: 'var(--text-tertiary)' }} />
                <input
                  type="text"
                  placeholder="Buscar IP, evento..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{
                    background: 'var(--bg-surface)',
                    border: '1px solid var(--border)',
                    color: '#fff',
                    fontSize: '0.75rem',
                    padding: '0.35rem 0.6rem 0.35rem 1.7rem',
                    borderRadius: 'var(--radius-md)',
                    outline: 'none',
                    width: '160px'
                  }}
                />
              </div>

              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                style={{
                  background: 'var(--bg-surface)',
                  border: '1px solid var(--border)',
                  color: 'var(--text-secondary)',
                  fontSize: '0.75rem',
                  padding: '0.35rem 0.5rem',
                  borderRadius: 'var(--radius-md)',
                  outline: 'none'
                }}
              >
                <option value="all">Todos</option>
                <option value="pageview">Vistas</option>
                <option value="click">Clics</option>
                <option value="form_submit">Formularios</option>
              </select>
            </div>
          </div>

          {/* Stream of Events */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', maxHeight: '520px', overflowY: 'auto' }}>
            {activeEventsList.length === 0 ? (
              <p style={{ color: 'var(--text-tertiary)', fontSize: '0.8rem', textAlign: 'center', padding: '3rem 0' }}>
                No se encontraron eventos coincidentes.
              </p>
            ) : (
              activeEventsList.map((ev, idx) => {
                const timeStr = new Date(ev.created_at).toLocaleTimeString();
                
                let badgeBg = 'rgba(96, 165, 250, 0.1)';
                let badgeColor = '#60a5fa';
                let badgeBorder = 'rgba(96, 165, 250, 0.2)';

                if (ev.event_type === 'click') {
                  badgeBg = 'rgba(245, 158, 11, 0.1)';
                  badgeColor = '#f59e0b';
                  badgeBorder = 'rgba(245, 158, 11, 0.2)';
                } else if (ev.event_type === 'form_submit') {
                  badgeBg = 'rgba(34, 197, 94, 0.1)';
                  badgeColor = '#22c55e';
                  badgeBorder = 'rgba(34, 197, 94, 0.2)';
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
                          padding: '0.1rem 0.4rem',
                          borderRadius: '4px',
                          fontSize: '0.65rem',
                          fontWeight: 700,
                          textTransform: 'uppercase'
                        }}>
                          {ev.event_type}
                        </span>
                        <span style={{ color: '#fff', fontSize: '0.8rem', fontWeight: 600 }}>
                          {ev.event_type === 'pageview' && `Página vista: ${ev.event_data?.page || 'Inicio'}`}
                          {ev.event_type === 'click' && `Hizo clic en: "${ev.event_data?.target || 'Elemento'}"`}
                          {ev.event_type === 'form_submit' && `Formulario: ${ev.event_data?.form || 'Cotización'}`}
                          {ev.event_type === 'session_start' && `Inicio de sesión (${ev.referrer || 'Directo'})`}
                        </span>
                      </div>
                      <span style={{ color: 'var(--text-tertiary)', fontSize: '0.72rem', fontFamily: 'monospace' }}>
                        {timeStr}
                      </span>
                    </div>

                    {/* Sub Info Row */}
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', fontSize: '0.73rem', color: 'var(--text-secondary)' }}>
                      <span>IP: <strong style={{ color: 'var(--text-primary)', fontFamily: 'monospace' }}>{ev.ip_address}</strong></span>
                      <span>Ubicación: <strong style={{ color: 'var(--text-primary)' }}>{ev.city}, {ev.country}</strong></span>
                      <span>Dispositivo: <strong style={{ color: 'var(--text-primary)' }}>{ev.device} ({ev.browser})</strong></span>
                    </div>

                    {/* Data JSON preview if form or details */}
                    {ev.event_data && Object.keys(ev.event_data).length > 0 && (
                      <div style={{
                        background: '#090909',
                        border: '1px solid #1f1f1f',
                        padding: '0.5rem 0.75rem',
                        borderRadius: '4px',
                        fontSize: '0.72rem',
                        fontFamily: 'monospace',
                        color: '#4ade80',
                        overflowX: 'auto',
                        marginTop: '0.2rem'
                      }}>
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
