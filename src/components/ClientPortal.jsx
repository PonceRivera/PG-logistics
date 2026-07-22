import React, { useState } from 'react';
import { Search, CheckCircle2, ArrowRight, AlertCircle, Mail } from 'lucide-react';
import { HUBS, UNIT_TYPES } from '../mockData';
import { fetchQuoteByFolio } from '../lib/database';

export default function ClientPortal({ activeTab, setActiveTab, quotes, onNewQuote }) {
  const [formData, setFormData] = useState({
    clientCompany: '',
    contactName: '',
    phone: '',
    email: '',
    origin: 'Monterrey, NL',
    destination: 'Saltillo, Coah',
    unitType: 'Caja Seca 53"',
    cargoType: '',
    weightTon: '15',
    dateRequired: ''
  });

  const [submittedQuote, setSubmittedQuote] = useState(null);
  const [searchFolio, setSearchFolio] = useState('');
  const [trackedShipment, setTrackedShipment] = useState(null);
  const [trackError, setTrackError] = useState(false);

  const handleQuoteSubmit = (e) => {
    e.preventDefault();
    const newFolio = `GPL-${Math.floor(1000 + Math.random() * 9000)}`;

    const newQuoteObj = {
      id: newFolio,
      clientCompany: formData.clientCompany,
      contactName: formData.contactName,
      phone: formData.phone,
      email: formData.email,
      origin: formData.origin,
      destination: formData.destination,
      unitType: formData.unitType,
      cargoType: formData.cargoType,
      weightTon: Number(formData.weightTon),
      dateRequired: formData.dateRequired,
      status: 'PENDIENTE',
      carrierCost: 0,
      marginPercent: 20,
      finalPrice: 0,
      createdAt: new Date().toISOString(),
      driverName: '',
      truckPlate: '',
      currentLocation: '',
      eta: ''
    };

    onNewQuote(newQuoteObj);
    setSubmittedQuote(newQuoteObj);
  };

  const handleTrackSubmit = async (e) => {
    e.preventDefault();
    setTrackError(false);
    setTrackedShipment(null);
    try {
      const found = await fetchQuoteByFolio(searchFolio.trim());
      if (found) { setTrackedShipment(found); }
      else { setTrackError(true); }
    } catch (err) {
      console.error('Track error:', err);
      setTrackError(true);
    }
  };

  const statusLabel = (s) => {
    const map = {
      PENDIENTE: { cls: 'badge-pending', text: 'Pendiente' },
      CONFIRMADO: { cls: 'badge-confirmed', text: 'Confirmado' }, // Fixed: changed COTIZADO to CONFIRMADO
      EN_TRANSITO: { cls: 'badge-transit', text: 'En Tránsito' },
      ENTREGADO: { cls: 'badge-delivered', text: 'Entregado' }
    };
    const m = map[s] || map.PENDIENTE;
    return <span className={`badge ${m.cls}`}>{m.text}</span>;
  };

  const getTimelineSteps = (status) => {
    const steps = ['PENDIENTE', 'CONFIRMADO', 'EN_TRANSITO', 'ENTREGADO'];
    const currentIdx = steps.indexOf(status);
    return [
      { title: 'Solicitud registrada', desc: 'Cotización recibida y en evaluación.', state: currentIdx >= 0 ? (currentIdx > 0 ? 'done' : 'current') : '' },
      { title: 'Tarifa confirmada', desc: 'Precio aprobado y unidad asignada.', state: currentIdx >= 1 ? (currentIdx > 1 ? 'done' : 'current') : '' },
      { title: 'En tránsito', desc: 'Unidad en camino hacia destino.', state: currentIdx >= 2 ? (currentIdx > 2 ? 'done' : 'current') : '' },
      { title: 'Entregado', desc: 'Mercancía recibida en destino.', state: currentIdx >= 3 ? 'done' : '' },
    ];
  };

  return (
    <div className="page-content">

      {/* === INICIO === */}
      {activeTab === 'inicio' && (
        <>
          <div className="section-header" style={{ marginBottom: '2.5rem', marginTop: '1rem' }}>
            <p className="section-overline">GP Logistics — Intermediación logística digital</p>
            <h1 className="section-title" style={{ fontSize: '1.75rem' }}>
              Cotiza y gestiona tus fletes industriales
            </h1>
            <p className="section-subtitle">
              Conectamos a tu empresa con líneas de transporte verificadas en Nuevo León y Coahuila. Cotización rápida, seguimiento por folio y comunicación directa por correo.
            </p>
            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1.25rem' }}>
              <button className="btn btn-primary" onClick={() => setActiveTab('cotizar')}>
                Solicitar cotización
              </button>
              <button className="btn btn-secondary" onClick={() => setActiveTab('rastreo')}>
                Rastrear envío
              </button>
            </div>
          </div>

          <div className="grid-3" style={{ marginBottom: '3rem' }}>
            <div className="card">
              <p className="card-title">Transportistas verificados</p>
              <p className="card-subtitle">Permiso SCT, póliza de seguro y GPS activo en cada viaje.</p>
            </div>
            <div className="card">
              <p className="card-title">Respuesta por correo</p>
              <p className="card-subtitle">Recibes tu cotización formal directamente en tu bandeja de entrada.</p>
            </div>
            <div className="card">
              <p className="card-title">Facturación en orden</p>
              <p className="card-subtitle">CFDI con complemento Carta Porte conforme a SAT.</p>
            </div>
          </div>
        </>
      )}

      {/* === COTIZADOR === */}
      {(activeTab === 'cotizar' || activeTab === 'inicio') && (
        <div className="card" style={{ marginBottom: '2rem' }}>
          <div className="card-header" style={{ flexDirection: 'column', alignItems: 'flex-start' }}>
            <p className="card-title" style={{ fontSize: '1rem' }}>Solicitud de cotización</p>
            <p className="card-subtitle">Completa los datos de tu carga. Recibirás respuesta por correo electrónico.</p>
          </div>

          {!submittedQuote ? (
            <form onSubmit={handleQuoteSubmit}>
              <div className="grid-2">
                <div className="form-group">
                  <label className="form-label">Empresa</label>
                  <input type="text" required placeholder="Razón social" className="form-control"
                    value={formData.clientCompany} onChange={e => setFormData({...formData, clientCompany: e.target.value})} />
                </div>
                <div className="form-group">
                  <label className="form-label">Contacto</label>
                  <input type="text" required placeholder="Nombre completo" className="form-control"
                    value={formData.contactName} onChange={e => setFormData({...formData, contactName: e.target.value})} />
                </div>
                <div className="form-group">
                  <label className="form-label">Teléfono</label>
                  <input type="tel" required placeholder="10 dígitos" className="form-control"
                    value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
                </div>
                <div className="form-group">
                  <label className="form-label">Correo electrónico</label>
                  <input type="email" required placeholder="contacto@empresa.com" className="form-control"
                    value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
                </div>
              </div>

              <hr className="divider" />

              <div className="grid-2">
                <div className="form-group">
                  <label className="form-label">Origen</label>
                  <select className="form-select" value={formData.origin} onChange={e => setFormData({...formData, origin: e.target.value})}>
                    {HUBS.map(h => <option key={h}>{h}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Destino</label>
                  <select className="form-select" value={formData.destination} onChange={e => setFormData({...formData, destination: e.target.value})}>
                    {HUBS.map(h => <option key={h}>{h}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Tipo de unidad</label>
                  <select className="form-select" value={formData.unitType} onChange={e => setFormData({...formData, unitType: e.target.value})}>
                    {UNIT_TYPES.map(u => <option key={u.id} value={u.name}>{u.name}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Tipo de mercancía</label>
                  <input type="text" placeholder="Ej. Piezas automotrices, tarimas" className="form-control"
                    value={formData.cargoType} onChange={e => setFormData({...formData, cargoType: e.target.value})} />
                </div>
                <div className="form-group">
                  <label className="form-label">Peso estimado (toneladas)</label>
                  <input type="number" min="1" max="30" className="form-control"
                    value={formData.weightTon} onChange={e => setFormData({...formData, weightTon: e.target.value})} />
                </div>
                <div className="form-group">
                  <label className="form-label">Fecha requerida</label>
                  <input type="date" required className="form-control"
                    value={formData.dateRequired} onChange={e => setFormData({...formData, dateRequired: e.target.value})} />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.75rem' }}>
                <button type="submit" className="btn btn-primary">Enviar solicitud</button>
              </div>
            </form>
          ) : (
            <div className="result-box">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem', color: 'var(--success)' }}>
                <CheckCircle2 size={20} />
                <span style={{ fontWeight: 600, fontSize: '0.95rem' }}>Solicitud registrada</span>
              </div>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
                Tu solicitud ha sido registrada. Recibirás la cotización formal en tu correo electrónico.
              </p>

              <div className="grid-2" style={{ gap: '0.75rem', marginBottom: '1.25rem' }}>
                <div>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Folio</span>
                  <p style={{ fontWeight: 700, fontSize: '1.1rem' }}>{submittedQuote.id}</p>
                </div>
                <div>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Ruta</span>
                  <p style={{ fontWeight: 500, fontSize: '0.88rem' }}>{submittedQuote.origin} → {submittedQuote.destination}</p>
                </div>
                <div>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Unidad</span>
                  <p style={{ fontWeight: 500, fontSize: '0.88rem' }}>{submittedQuote.unitType}</p>
                </div>
                <div>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Correo de contacto</span>
                  <p style={{ fontWeight: 500, fontSize: '0.88rem' }}>{submittedQuote.email}</p>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button className="btn btn-secondary" onClick={() => { setSubmittedQuote(null); }}>
                  Nueva cotización
                </button>
                <button className="btn btn-ghost" onClick={() => { setActiveTab('rastreo'); setSearchFolio(submittedQuote.id); }}>
                  Rastrear este folio →
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* === RASTREO === */}
      {(activeTab === 'rastreo' || activeTab === 'inicio') && (
        <div className="card" style={{ marginBottom: '2rem' }}>
          <div className="card-header" style={{ flexDirection: 'column', alignItems: 'flex-start' }}>
            <p className="card-title" style={{ fontSize: '1rem' }}>Rastreo de embarque</p>
            <p className="card-subtitle">Ingresa tu folio de seguimiento para consultar el estado de tu envío.</p>
          </div>

          <form onSubmit={handleTrackSubmit} style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
            <input type="text" placeholder="Ej. GPL-8492" className="form-control"
              style={{ textTransform: 'uppercase', maxWidth: '280px' }}
              value={searchFolio} onChange={e => setSearchFolio(e.target.value)} />
            <button type="submit" className="btn btn-primary">
              <Search size={15} /> Buscar
            </button>
          </form>

          {trackError && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.6rem 0.8rem', background: 'var(--danger-soft)', borderRadius: 'var(--radius-md)', color: 'var(--danger)', fontSize: '0.82rem' }}>
              <AlertCircle size={15} /> Folio no encontrado. Verifica el código e intenta de nuevo.
            </div>
          )}

          {trackedShipment && (
            <div className="result-box">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '1rem' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                    <span style={{ fontWeight: 700 }}>{trackedShipment.id}</span>
                    {statusLabel(trackedShipment.status)}
                  </div>
                  <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>{trackedShipment.clientCompany}</p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>{trackedShipment.origin} → {trackedShipment.destination}</p>
                  <p style={{ fontSize: '0.78rem', color: 'var(--text-tertiary)' }}>{trackedShipment.unitType}</p>
                </div>
              </div>

              <div className="timeline">
                {getTimelineSteps(trackedShipment.status).map((step, i) => (
                  <div key={i} className={`timeline-step ${step.state}`}>
                    <div className="timeline-dot"></div>
                    <p className="timeline-step-title">{step.title}</p>
                    <p className="timeline-step-desc">{step.desc}</p>
                  </div>
                ))}
              </div>

              {trackedShipment.driverName && (
                <>
                  <hr className="divider" />
                  <div className="grid-2" style={{ gap: '0.5rem' }}>
                    <div>
                      <span style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)' }}>Operador</span>
                      <p style={{ fontSize: '0.85rem' }}>{trackedShipment.driverName}</p>
                    </div>
                    <div>
                      <span style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)' }}>Placas</span>
                      <p style={{ fontSize: '0.85rem' }}>{trackedShipment.truckPlate}</p>
                    </div>
                    {trackedShipment.currentLocation && (
                      <div>
                        <span style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)' }}>Ubicación actual</span>
                        <p style={{ fontSize: '0.85rem' }}>{trackedShipment.currentLocation}</p>
                      </div>
                    )}
                    {trackedShipment.eta && (
                      <div>
                        <span style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)' }}>ETA</span>
                        <p style={{ fontSize: '0.85rem' }}>{trackedShipment.eta}</p>
                      </div>
                    )}
                  </div>
                </>
              )}

              {trackedShipment.trackingHistory && trackedShipment.trackingHistory.length > 0 && (
                <>
                  <hr className="divider" />
                  <p style={{ fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.75rem' }}>Bitácora de Eventos</p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {trackedShipment.trackingHistory.map((ev, i) => (
                      <div key={i} style={{ display: 'flex', flexDirection: 'column' }}>
                        <span style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)' }}>
                          {new Date(ev.timestamp).toLocaleString('es-MX', {day: '2-digit', month: 'short', hour:'2-digit', minute:'2-digit'})}
                        </span>
                        <p style={{ fontSize: '0.85rem', color: 'var(--text-primary)' }}>
                          {ev.message}
                          {ev.location && <span style={{ color: 'var(--text-secondary)', marginLeft: '0.5rem' }}>📍 {ev.location}</span>}
                        </p>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      )}

      {/* === COBERTURA === */}
      {activeTab === 'cobertura' && (
        <div style={{ marginTop: '0.5rem' }}>
          <div className="section-header">
            <p className="section-overline">Zonas de operación</p>
            <h2 className="section-title">Cobertura en el corredor industrial NL — Coahuila</h2>
          </div>

          <div className="grid-3">
            <div className="card">
              <p className="card-title">Área Metropolitana de Monterrey</p>
              <ul style={{ paddingLeft: '1rem', color: 'var(--text-secondary)', fontSize: '0.82rem', lineHeight: '1.9', listStyle: 'none' }}>
                <li>• Apodaca (Parques Industriales)</li>
                <li>• Santa Catarina y García</li>
                <li>• Escobedo y Ciénega de Flores</li>
                <li>• Guadalupe y San Nicolás</li>
              </ul>
            </div>
            <div className="card">
              <p className="card-title">Corredor Saltillo — Ramos Arizpe</p>
              <ul style={{ paddingLeft: '1rem', color: 'var(--text-secondary)', fontSize: '0.82rem', lineHeight: '1.9', listStyle: 'none' }}>
                <li>• Ramos Arizpe (Sector Automotriz)</li>
                <li>• Saltillo (Zona Industrial)</li>
                <li>• Arteaga y Derramadero</li>
                <li>• Monclova y Sabinas</li>
              </ul>
            </div>
            <div className="card">
              <p className="card-title">Rutas foráneas frecuentes</p>
              <ul style={{ paddingLeft: '1rem', color: 'var(--text-secondary)', fontSize: '0.82rem', lineHeight: '1.9', listStyle: 'none' }}>
                <li>• Nuevo Laredo (Exportación)</li>
                <li>• Querétaro y San Luis Potosí</li>
                <li>• Ciudad de México</li>
                <li>• Guadalajara y Bajío</li>
              </ul>
            </div>
          </div>

          <div style={{ marginTop: '1.5rem' }}>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-tertiary)' }}>
              ¿Necesitas cobertura fuera de estas zonas? Escríbenos a <strong style={{ color: 'var(--text-secondary)' }}>contacto@grupoponcelogistics.com</strong> y te buscamos disponibilidad.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
