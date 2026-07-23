import React, { useState } from 'react';
import { Plus, DollarSign, Truck, TrendingUp, Clock, Send, Shield, Mail } from 'lucide-react';

export default function AdminPortal({ quotes, onUpdateQuote, carriers, onAddCarrier }) {
  const [pricingQuote, setPricingQuote] = useState(null);
  const [dispatchQuote, setDispatchQuote] = useState(null);
  const [showCarrierModal, setShowCarrierModal] = useState(false);

  // Pricing form
  const [carrierCost, setCarrierCost] = useState('');
  const [marginPct, setMarginPct] = useState('20');

  // Dispatch form
  const [driverName, setDriverName] = useState('');
  const [truckPlate, setTruckPlate] = useState('');
  const [location, setLocation] = useState('');
  const [eta, setEta] = useState('');
  const [status, setStatus] = useState('EN_TRANSITO');
  const [trackingHistory, setTrackingHistory] = useState([]);
  const [newMessage, setNewMessage] = useState('');

  // New carrier form
  const [nc, setNc] = useState({ companyName: '', baseCity: '', units: '', contactName: '', phone: '', sctPermit: '' });

  // Metrics
  const pending = quotes.filter(q => q.status === 'PENDIENTE').length;
  const transit = quotes.filter(q => q.status === 'EN_TRANSITO').length;
  const revenue = quotes.filter(q => q.status !== 'PENDIENTE').reduce((s, q) => s + (q.finalPrice || 0), 0);
  const profit = quotes.filter(q => q.status !== 'PENDIENTE').reduce((s, q) => s + ((q.finalPrice || 0) - (q.carrierCost || 0)), 0);

  const openPricing = (q) => {
    setPricingQuote(q);
    setCarrierCost(q.carrierCost ? String(q.carrierCost) : '');
    setMarginPct(q.marginPercent ? String(q.marginPercent) : '20');
  };

  const savePricing = () => {
    const cost = Number(carrierCost) || 0;
    const margin = Number(marginPct) || 0;
    onUpdateQuote({ ...pricingQuote, carrierCost: cost, marginPercent: margin, finalPrice: Math.round(cost * (1 + margin / 100)), status: 'CONFIRMADO' });
    setPricingQuote(null);
  };

  const openDispatch = (q) => {
    setDispatchQuote(q);
    setDriverName(q.driverName || '');
    setTruckPlate(q.truckPlate || '');
    setLocation(q.currentLocation || '');
    setEta(q.eta || '');
    setStatus(q.status);
    setTrackingHistory(q.trackingHistory || []);
    setNewMessage('');
  };

  const saveDispatch = () => {
    onUpdateQuote({ ...dispatchQuote, driverName, truckPlate, currentLocation: location, eta, status, trackingHistory });
    setDispatchQuote(null);
  };

  const addTrackingEvent = () => {
    if (!newMessage.trim()) return;
    const event = {
      timestamp: new Date().toISOString(),
      message: newMessage.trim(),
      location: location.trim()
    };
    setTrackingHistory(prev => [event, ...prev]);
    setNewMessage('');
  };

  const addCarrier = (e) => {
    e.preventDefault();
    onAddCarrier({
      id: `CAR-${String(carriers.length + 1).padStart(2, '0')}`,
      companyName: nc.companyName,
      baseCity: nc.baseCity,
      units: nc.units.split(',').map(u => u.trim()),
      contactName: nc.contactName,
      phone: nc.phone,
      sctPermit: nc.sctPermit || 'Pendiente',
      insuranceValid: true,
      gpsActive: true,
      rating: 5.0
    });
    setShowCarrierModal(false);
    setNc({ companyName: '', baseCity: '', units: '', contactName: '', phone: '', sctPermit: '' });
  };

  const calcFinal = Math.round((Number(carrierCost) || 0) * (1 + (Number(marginPct) || 0) / 100));
  const calcProfit = calcFinal - (Number(carrierCost) || 0);

  return (
    <div className="page-content">
      {/* Header */}
      <div className="section-header" style={{ marginTop: '0.5rem' }}>
        <p className="section-overline">Panel de administración</p>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
          <h1 className="section-title">Operaciones</h1>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid-4" style={{ marginBottom: '1.5rem' }}>
        <div className="stat-card">
          <p className="stat-label">Pendientes</p>
          <p className="stat-value">{pending}</p>
          <p className="stat-hint">Sin tarifa asignada</p>
        </div>
        <div className="stat-card">
          <p className="stat-label">En tránsito</p>
          <p className="stat-value">{transit}</p>
          <p className="stat-hint">GPS activo</p>
        </div>
        <div className="stat-card">
          <p className="stat-label">Facturación</p>
          <p className="stat-value">${revenue.toLocaleString()}</p>
          <p className="stat-hint">MXN contratado</p>
        </div>
        <div className="stat-card">
          <p className="stat-label">Utilidad bruta</p>
          <p className="stat-value" style={{ color: 'var(--success)' }}>${profit.toLocaleString()}</p>
          <p className="stat-hint">MXN ganancia</p>
        </div>
      </div>

      {/* Quotes Table */}
      <div className="card" style={{ marginBottom: '1.5rem' }}>
        <div className="card-header">
          <div>
            <p className="card-title">Solicitudes de cotización</p>
            <p className="card-subtitle">Asigna costo del fletero y tu margen para generar la tarifa al cliente.</p>
          </div>
        </div>

        <div className="table-wrap">
          <table className="clean-table">
            <thead>
              <tr>
                <th>Folio</th>
                <th>Cliente</th>
                <th>Ruta</th>
                <th>Unidad</th>
                <th>Estado</th>
                <th>Fletero</th>
                <th>Precio cliente</th>
                <th>Ganancia</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {quotes.map(q => {
                const qProfit = (q.finalPrice || 0) - (q.carrierCost || 0);
                const statusMap = {
                  PENDIENTE: 'badge-pending',
                  CONFIRMADO: 'badge-confirmed',
                  EN_TRANSITO: 'badge-transit',
                  ENTREGADO: 'badge-delivered'
                };
                const statusText = {
                  PENDIENTE: 'Pendiente',
                  CONFIRMADO: 'Confirmado',
                  EN_TRANSITO: 'En tránsito',
                  ENTREGADO: 'Entregado'
                };
                return (
                  <tr key={q.id}>
                    <td><strong>{q.id}</strong></td>
                    <td>
                      <div style={{ lineHeight: '1.3' }}>
                        <span style={{ fontWeight: 500 }}>{q.clientCompany}</span>
                        <br />
                        <span style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)' }}>{q.contactName}</span>
                      </div>
                    </td>
                    <td style={{ fontSize: '0.8rem' }}>{q.origin} → {q.destination}</td>
                    <td style={{ fontSize: '0.8rem' }}>{q.unitType}</td>
                    <td><span className={`badge ${statusMap[q.status]}`}>{statusText[q.status]}</span></td>
                    <td>{q.carrierCost ? `$${q.carrierCost.toLocaleString()}` : '—'}</td>
                    <td>{q.finalPrice ? `$${q.finalPrice.toLocaleString()}` : '—'}</td>
                    <td style={{ color: qProfit > 0 ? 'var(--success)' : 'var(--text-tertiary)', fontWeight: 500 }}>
                      {qProfit > 0 ? `+$${qProfit.toLocaleString()}` : '—'}
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.25rem' }}>
                        <button className="btn btn-ghost btn-sm" onClick={() => openPricing(q)} title="Asignar tarifa">
                          <DollarSign size={14} />
                        </button>
                        <button className="btn btn-ghost btn-sm" onClick={() => openDispatch(q)} title="Despacho">
                          <Truck size={14} />
                        </button>
                        {q.email && (
                          <a className="btn btn-ghost btn-sm"
                            href={`mailto:${q.email}?subject=Cotización ${q.id} — GP Logistics&body=Estimado(a) ${q.contactName},%0D%0A%0D%0ADe parte de Grupo Ponce Logistics, le compartimos la cotización para el folio ${q.id}:%0D%0A%0D%0ARuta: ${q.origin} → ${q.destination}%0D%0AUnidad: ${q.unitType}%0D%0ATarifa: $${(q.finalPrice || 0).toLocaleString()} MXN + IVA%0D%0A%0D%0AQuedamos a sus órdenes.%0D%0AGP Logistics`}
                            title="Enviar cotización por correo"
                          >
                            <Mail size={14} />
                          </a>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* === PRICING MODAL === */}
      {pricingQuote && (
        <div className="modal-overlay" onClick={() => setPricingQuote(null)}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <p className="modal-title">Asignar tarifa · {pricingQuote.id}</p>
            <p className="modal-desc">{pricingQuote.origin} → {pricingQuote.destination} ({pricingQuote.unitType})</p>

            <div className="form-group">
              <label className="form-label">Costo del fletero (MXN)</label>
              <input type="number" className="form-control" placeholder="Ej. 14000"
                value={carrierCost} onChange={e => setCarrierCost(e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">Tu margen (%)</label>
              <input type="number" className="form-control"
                value={marginPct} onChange={e => setMarginPct(e.target.value)} />
            </div>

            <div className="calc-preview">
              <div className="calc-row">
                <span className="calc-label">Precio al cliente</span>
                <span className="calc-value">${calcFinal.toLocaleString()} MXN + IVA</span>
              </div>
              <div className="calc-row">
                <span className="calc-label">Tu ganancia</span>
                <span className="calc-value" style={{ color: 'var(--success)' }}>+${calcProfit.toLocaleString()} MXN</span>
              </div>
            </div>

            <div className="modal-actions">
              <button className="btn btn-secondary btn-sm" onClick={() => setPricingQuote(null)}>Cancelar</button>
              <button className="btn btn-primary btn-sm" onClick={savePricing}>Confirmar tarifa</button>
            </div>

            {pricingQuote.email && (
              <>
                <hr className="divider" />
                <a className="btn btn-secondary" style={{ width: '100%' }}
                  href={`mailto:${pricingQuote.email}?subject=Cotización ${pricingQuote.id} — GP Logistics&body=Estimado(a) ${pricingQuote.contactName},%0D%0A%0D%0ADe parte de Grupo Ponce Logistics, le compartimos la cotización formal:%0D%0A%0D%0AFolio: ${pricingQuote.id}%0D%0ARuta: ${pricingQuote.origin} → ${pricingQuote.destination}%0D%0AUnidad: ${pricingQuote.unitType}%0D%0ATarifa: $${calcFinal.toLocaleString()} MXN + IVA%0D%0A%0D%0AQuedamos a sus órdenes.%0D%0AContacto: contacto@grupoponcelogistics.com%0D%0AGP Logistics`}
                >
                  <Mail size={14} /> Enviar cotización por correo a {pricingQuote.email}
                </a>
              </>
            )}
          </div>
        </div>
      )}

      {/* === DISPATCH MODAL === */}
      {dispatchQuote && (
        <div className="modal-overlay" onClick={() => setDispatchQuote(null)}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <p className="modal-title">Despacho · {dispatchQuote.id}</p>
            <p className="modal-desc">{dispatchQuote.origin} → {dispatchQuote.destination}</p>

            <div className="form-group">
              <label className="form-label">Estado del embarque</label>
              <select className="form-select" value={status} onChange={e => setStatus(e.target.value)}>
                <option value="PENDIENTE">Pendiente</option>
                <option value="CONFIRMADO">Confirmado</option>
                <option value="EN_TRANSITO">En tránsito</option>
                <option value="ENTREGADO">Entregado</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Operador</label>
              <input type="text" className="form-control" placeholder="Nombre del chofer"
                value={driverName} onChange={e => setDriverName(e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">Placas</label>
              <input type="text" className="form-control" placeholder="Ej. 84-AA-2X"
                value={truckPlate} onChange={e => setTruckPlate(e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">Ubicación actual</label>
              <input type="text" className="form-control" placeholder="Reporte GPS"
                value={location} onChange={e => setLocation(e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">ETA</label>
              <input type="text" className="form-control" placeholder="Ej. Hoy 16:30"
                value={eta} onChange={e => setEta(e.target.value)} />
            </div>

            <div style={{ marginTop: '1.5rem', borderTop: '1px solid var(--border)', paddingTop: '1rem' }}>
              <p style={{ fontSize: '0.9rem', fontWeight: 600, marginBottom: '0.5rem' }}>Bitácora de Rastreo</p>
              <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
                <input type="text" className="form-control" placeholder="Ej. Descargando en destino"
                  value={newMessage} onChange={e => setNewMessage(e.target.value)} />
                <button type="button" className="btn btn-secondary btn-sm" onClick={addTrackingEvent} style={{ whiteSpace: 'nowrap' }}>
                  <Plus size={14} /> Registrar
                </button>
              </div>
              
              {trackingHistory.length > 0 && (
                <div style={{ background: 'var(--bg-main)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', padding: '0.5rem', maxHeight: '150px', overflowY: 'auto' }}>
                  {trackingHistory.map((ev, i) => (
                    <div key={i} style={{ fontSize: '0.8rem', padding: '0.35rem 0', borderBottom: i < trackingHistory.length -1 ? '1px solid var(--border)' : 'none' }}>
                      <span style={{ color: 'var(--text-tertiary)', marginRight: '0.5rem' }}>{new Date(ev.timestamp).toLocaleString('es-MX', {day: '2-digit', month: 'short', hour:'2-digit', minute:'2-digit'})}</span>
                      <span style={{ color: 'var(--text-primary)' }}>{ev.message}</span>
                      {ev.location && <span style={{ color: 'var(--text-secondary)', marginLeft: '0.5rem' }}>📍 {ev.location}</span>}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="modal-actions">
              <button className="btn btn-secondary btn-sm" onClick={() => setDispatchQuote(null)}>Cancelar</button>
              <button className="btn btn-primary btn-sm" onClick={saveDispatch}>Guardar</button>
            </div>
          </div>
        </div>
      )}

      {/* === NEW CARRIER MODAL === */}
      {showCarrierModal && (
        <div className="modal-overlay" onClick={() => setShowCarrierModal(false)}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <p className="modal-title">Agregar transportista</p>
            <p className="modal-desc">Registra una nueva línea de transporte aliada.</p>
            <form onSubmit={addCarrier}>
              <div className="form-group">
                <label className="form-label">Nombre / Razón social</label>
                <input type="text" required className="form-control"
                  value={nc.companyName} onChange={e => setNc({...nc, companyName: e.target.value})} />
              </div>
              <div className="form-group">
                <label className="form-label">Ciudad base</label>
                <input type="text" required className="form-control" placeholder="Ej. Monterrey, NL"
                  value={nc.baseCity} onChange={e => setNc({...nc, baseCity: e.target.value})} />
              </div>
              <div className="form-group">
                <label className="form-label">Tipos de unidad (separados por coma)</label>
                <input type="text" required className="form-control" placeholder='Ej. Caja 53", Rabón'
                  value={nc.units} onChange={e => setNc({...nc, units: e.target.value})} />
              </div>
              <div className="form-group">
                <label className="form-label">Contacto</label>
                <input type="text" required className="form-control"
                  value={nc.contactName} onChange={e => setNc({...nc, contactName: e.target.value})} />
              </div>
              <div className="form-group">
                <label className="form-label">Teléfono</label>
                <input type="tel" required className="form-control"
                  value={nc.phone} onChange={e => setNc({...nc, phone: e.target.value})} />
              </div>
              <div className="form-group">
                <label className="form-label">Permiso SCT</label>
                <input type="text" className="form-control" placeholder="Opcional"
                  value={nc.sctPermit} onChange={e => setNc({...nc, sctPermit: e.target.value})} />
              </div>
              <div className="modal-actions">
                <button type="button" className="btn btn-secondary btn-sm" onClick={() => setShowCarrierModal(false)}>Cancelar</button>
                <button type="submit" className="btn btn-primary btn-sm">Registrar</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
