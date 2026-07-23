import React, { useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import { Search, MapPin, AlertCircle, Clock, Route } from 'lucide-react';
import { fetchQuoteByFolio } from '../lib/database';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default Leaflet marker icon in React
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

const truckIcon = new L.DivIcon({
  html: `<div style="background: #e14a15; width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center; border: 3px solid #fff; box-shadow: 0 2px 8px rgba(0,0,0,0.3); font-size: 16px;">🚛</div>`,
  iconSize: [32, 32], iconAnchor: [16, 16], className: '',
});

const originIcon = new L.DivIcon({
  html: `<div style="background: #22c55e; width: 28px; height: 28px; border-radius: 50%; display: flex; align-items: center; justify-content: center; border: 3px solid #fff; box-shadow: 0 2px 8px rgba(0,0,0,0.3); font-size: 13px;">📦</div>`,
  iconSize: [28, 28], iconAnchor: [14, 14], className: '',
});

const destIcon = new L.DivIcon({
  html: `<div style="background: #3b82f6; width: 28px; height: 28px; border-radius: 50%; display: flex; align-items: center; justify-content: center; border: 3px solid #fff; box-shadow: 0 2px 8px rgba(0,0,0,0.3); font-size: 13px;">🏁</div>`,
  iconSize: [28, 28], iconAnchor: [14, 14], className: '',
});

// Known locations with coordinates (Mexico)
const LOCATIONS = {
  'monterrey, nl': [25.6866, -100.3161],
  'saltillo, coah': [25.4232, -100.9924],
  'ramos arizpe, coah': [25.5389, -100.9511],
  'apodaca, nl': [25.7815, -100.1884],
  'nuevo laredo, tamps': [27.4763, -99.5076],
  'querétaro, qro': [20.5888, -100.3899],
  'san luis potosí, slp': [22.1565, -100.9855],
  'cdmx': [19.4326, -99.1332],
  'guadalajara, jal': [20.6597, -103.3496],
  'garcía, nl': [25.8150, -100.5917],
  'santa catarina, nl': [25.6714, -100.4607],
  'escobedo, nl': [25.7947, -100.3389],
  'monclova, coah': [26.9075, -101.4211],
  'matehuala, slp': [23.6525, -100.6447],
  'laredo': [27.4763, -99.5076],
  'monterrey': [25.6866, -100.3161],
  'saltillo': [25.4232, -100.9924],
  'ramos arizpe': [25.5389, -100.9511],
  'apodaca': [25.7815, -100.1884],
  'queretaro': [20.5888, -100.3899],
  'san luis potosi': [22.1565, -100.9855],
  'guadalajara': [20.6597, -103.3496],
  'monclova': [26.9075, -101.4211],
  'matehuala': [23.6525, -100.6447],
};

function getCoords(locationText) {
  if (!locationText) return null;
  const key = locationText.toLowerCase().trim();
  if (LOCATIONS[key]) return LOCATIONS[key];
  for (const [name, coords] of Object.entries(LOCATIONS)) {
    if (key.includes(name) || name.includes(key)) return coords;
  }
  return null;
}

// Calculate distance in km between two coordinates (Haversine formula)
function calculateDistanceKm(coord1, coord2) {
  if (!coord1 || !coord2) return 0;
  const R = 6371;
  const dLat = (coord2[0] - coord1[0]) * Math.PI / 180;
  const dLon = (coord2[1] - coord1[1]) * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(coord1[0] * Math.PI / 180) * Math.cos(coord2[0] * Math.PI / 180) * Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 1.3); // 1.3 factor for road distance (roads aren't straight)
}

// Estimate travel time based on distance (avg speed 70 km/h for trucks in Mexico)
function estimateTravelTime(distanceKm) {
  const avgSpeedKmh = 70;
  const totalHours = distanceKm / avgSpeedKmh;
  const hours = Math.floor(totalHours);
  const minutes = Math.round((totalHours - hours) * 60);
  return { hours, minutes, totalHours };
}

// Simulate truck position based on status and time elapsed
function simulateTruckPosition(originCoords, destCoords, status, createdAt) {
  if (!originCoords || !destCoords) return originCoords;
  if (status === 'PENDIENTE' || status === 'CONFIRMADO') return originCoords;
  if (status === 'ENTREGADO') return destCoords;

  // EN_TRANSITO: simulate position based on time elapsed since creation
  const now = new Date();
  const created = new Date(createdAt);
  const hoursElapsed = (now - created) / (1000 * 60 * 60);
  const totalDistKm = calculateDistanceKm(originCoords, destCoords);
  const totalHours = totalDistKm / 70;
  const progress = Math.min(hoursElapsed / Math.max(totalHours, 1), 0.92); // Max 92% until delivered

  const lat = originCoords[0] + (destCoords[0] - originCoords[0]) * progress;
  const lon = originCoords[1] + (destCoords[1] - originCoords[1]) * progress;
  return [lat, lon];
}

function getStatusInfo(status) {
  const map = {
    PENDIENTE: { color: '#f59e0b', text: 'Pendiente', desc: 'En evaluación' },
    CONFIRMADO: { color: '#3b82f6', text: 'Confirmado', desc: 'Tarifa asignada, unidad por salir' },
    EN_TRANSITO: { color: '#22c55e', text: 'En Tránsito', desc: 'Unidad en camino' },
    ENTREGADO: { color: '#8b5cf6', text: 'Entregado', desc: 'Mercancía recibida' },
  };
  return map[status] || map.PENDIENTE;
}

export default function TrackingMap() {
  const [folio, setFolio] = useState('');
  const [shipment, setShipment] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!folio.trim()) return;
    setError('');
    setShipment(null);
    setLoading(true);
    try {
      const found = await fetchQuoteByFolio(folio.trim().toUpperCase());
      if (found) { setShipment(found); }
      else { setError('No se encontró ningún embarque con ese folio. Verifica el número e intenta de nuevo.'); }
    } catch (err) {
      console.error(err);
      setError('Error al buscar el embarque. Intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  const originCoords = shipment ? getCoords(shipment.origin) : null;
  const destCoords = shipment ? getCoords(shipment.destination) : null;
  const truckCoords = shipment ? simulateTruckPosition(originCoords, destCoords, shipment.status, shipment.createdAt) : null;
  const statusInfo = shipment ? getStatusInfo(shipment.status) : null;

  // Route calculations
  const distanceKm = (originCoords && destCoords) ? calculateDistanceKm(originCoords, destCoords) : 0;
  const travelTime = estimateTravelTime(distanceKm);

  const mapCenter = truckCoords || originCoords || [24.0, -100.5];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 56px)', overflow: 'hidden' }}>
      
      {/* Search Bar */}
      <div style={{ padding: '1rem 1.5rem', background: 'var(--bg-card)', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
        <form onSubmit={handleSearch} style={{ display: 'flex', gap: '0.5rem', flex: 1, minWidth: '280px' }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <Search size={16} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)' }} />
            <input type="text" className="form-control" placeholder="Ingresa tu folio (ej. GPL-9585)" value={folio} onChange={e => setFolio(e.target.value)} style={{ paddingLeft: '2.25rem' }} />
          </div>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Buscando...' : 'Rastrear'}
          </button>
        </form>
        {shipment && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>{shipment.id}</span>
            <span style={{ fontSize: '0.72rem', fontWeight: 600, padding: '0.2rem 0.6rem', borderRadius: '12px', background: statusInfo.color + '20', color: statusInfo.color }}>
              {statusInfo.text}
            </span>
          </div>
        )}
      </div>

      {/* Main: Map + Panel */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        
        {/* Map */}
        <div style={{ flex: 1, position: 'relative' }}>
          {!shipment && !error && (
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-main)', zIndex: 5, gap: '1rem' }}>
              <MapPin size={48} style={{ color: 'var(--text-tertiary)', opacity: 0.5 }} />
              <p style={{ color: 'var(--text-tertiary)', fontSize: '0.9rem', textAlign: 'center', maxWidth: '340px' }}>Ingresa un folio de seguimiento para ver la ruta estimada y ubicación de tu carga en el mapa.</p>
            </div>
          )}
          {error && (
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-main)', zIndex: 5, gap: '0.75rem' }}>
              <AlertCircle size={36} style={{ color: 'var(--danger)' }} />
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', maxWidth: '300px', textAlign: 'center' }}>{error}</p>
            </div>
          )}
          {shipment && (
            <MapContainer key={`${mapCenter[0]}-${mapCenter[1]}`} center={mapCenter} zoom={7} style={{ height: '100%', width: '100%' }}>
              <TileLayer attribution='&copy; <a href="https://openstreetmap.org">OpenStreetMap</a>' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
              {originCoords && (
                <Marker position={originCoords} icon={originIcon}>
                  <Popup><strong>📦 Origen</strong><br />{shipment.origin}{shipment.originAddress && <><br /><small>{shipment.originAddress}</small></>}</Popup>
                </Marker>
              )}
              {destCoords && (
                <Marker position={destCoords} icon={destIcon}>
                  <Popup><strong>🏁 Destino</strong><br />{shipment.destination}{shipment.destinationAddress && <><br /><small>{shipment.destinationAddress}</small></>}</Popup>
                </Marker>
              )}
              {truckCoords && (shipment.status === 'EN_TRANSITO' || shipment.status === 'CONFIRMADO') && (
                <Marker position={truckCoords} icon={truckIcon}>
                  <Popup>
                    <strong>🚛 Posición estimada</strong><br />
                    Calculada por IA según ruta y tiempo<br />
                    {shipment.driverName && <>Operador: {shipment.driverName}<br /></>}
                    {shipment.truckPlate && <>Placas: {shipment.truckPlate}</>}
                  </Popup>
                </Marker>
              )}
              {originCoords && destCoords && (
                <Polyline positions={[originCoords, ...(truckCoords && truckCoords !== originCoords && truckCoords !== destCoords ? [truckCoords] : []), destCoords]} color="#e14a15" weight={3} opacity={0.6} dashArray="10 6" />
              )}
            </MapContainer>
          )}
        </div>

        {/* Info Panel */}
        {shipment && (
          <div style={{ width: '320px', background: 'var(--bg-card)', borderLeft: '1px solid var(--border)', overflowY: 'auto', padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            
            {/* Route */}
            <div>
              <p style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)', marginBottom: '0.35rem' }}>RUTA</p>
              <p style={{ fontSize: '0.9rem', fontWeight: 600 }}>{shipment.origin}</p>
              {shipment.originAddress && <p style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>📍 {shipment.originAddress}</p>}
              <p style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)', margin: '0.15rem 0' }}>↓</p>
              <p style={{ fontSize: '0.9rem', fontWeight: 600 }}>{shipment.destination}</p>
              {shipment.destinationAddress && <p style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>📍 {shipment.destinationAddress}</p>}
            </div>

            <hr style={{ border: 'none', borderTop: '1px solid var(--border)' }} />

            {/* AI Route Estimate */}
            <div style={{ background: 'var(--bg-main)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', padding: '0.75rem' }}>
              <p style={{ fontSize: '0.72rem', color: 'var(--primary)', fontWeight: 600, marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                <Route size={12} /> ESTIMACIÓN INTELIGENTE
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                <div>
                  <p style={{ fontSize: '0.68rem', color: 'var(--text-tertiary)' }}>Distancia</p>
                  <p style={{ fontSize: '0.88rem', fontWeight: 600 }}>{distanceKm.toLocaleString()} km</p>
                </div>
                <div>
                  <p style={{ fontSize: '0.68rem', color: 'var(--text-tertiary)' }}>Tiempo estimado</p>
                  <p style={{ fontSize: '0.88rem', fontWeight: 600 }}>{travelTime.hours}h {travelTime.minutes}min</p>
                </div>
              </div>
              <p style={{ fontSize: '0.65rem', color: 'var(--text-tertiary)', marginTop: '0.4rem', fontStyle: 'italic' }}>
                * Cálculo basado en velocidad promedio de 70 km/h por carretera federal.
              </p>
            </div>

            <hr style={{ border: 'none', borderTop: '1px solid var(--border)' }} />

            {/* Status */}
            <div>
              <p style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)', marginBottom: '0.35rem' }}>ESTADO</p>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <div style={{ width: 10, height: 10, borderRadius: '50%', background: statusInfo.color }} />
                <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>{statusInfo.text}</span>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>— {statusInfo.desc}</span>
              </div>
            </div>

            {/* Details */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <div>
                <p style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)' }}>Unidad</p>
                <p style={{ fontSize: '0.82rem' }}>{shipment.unitType}</p>
              </div>
              {shipment.driverName && <div><p style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)' }}>Operador</p><p style={{ fontSize: '0.82rem' }}>{shipment.driverName}</p></div>}
              {shipment.truckPlate && <div><p style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)' }}>Placas</p><p style={{ fontSize: '0.82rem' }}>{shipment.truckPlate}</p></div>}
              {shipment.eta && <div><p style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)' }}>ETA</p><p style={{ fontSize: '0.82rem' }}>{shipment.eta}</p></div>}
            </div>

            {/* Tracking History */}
            {shipment.trackingHistory && shipment.trackingHistory.length > 0 && (
              <>
                <hr style={{ border: 'none', borderTop: '1px solid var(--border)' }} />
                <div>
                  <p style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)', marginBottom: '0.5rem' }}>BITÁCORA</p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                    {shipment.trackingHistory.map((ev, i) => (
                      <div key={i} style={{ display: 'flex', gap: '0.5rem' }}>
                        <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--primary)', marginTop: '0.35rem', flexShrink: 0 }} />
                        <div>
                          <p style={{ fontSize: '0.78rem', color: 'var(--text-primary)' }}>{ev.message}</p>
                          <p style={{ fontSize: '0.68rem', color: 'var(--text-tertiary)' }}>
                            {new Date(ev.timestamp).toLocaleString('es-MX', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                            {ev.location && ` · 📍 ${ev.location}`}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}

            {/* Contact */}
            <hr style={{ border: 'none', borderTop: '1px solid var(--border)' }} />
            <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
              ¿Tienes dudas sobre tu envío? Escríbenos a{' '}
              <a href="mailto:contacto@grupoponcelogistics.com" style={{ color: 'var(--primary)' }}>contacto@grupoponcelogistics.com</a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
