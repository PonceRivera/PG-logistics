import { supabase, isSupabaseConfigured } from './supabase';
import { INITIAL_QUOTES, INITIAL_CARRIERS } from '../mockData';

// ============================================================
// QUOTES
// ============================================================

export async function fetchQuotes() {
  if (!isSupabaseConfigured) {
    const saved = localStorage.getItem('gpl_quotes');
    return saved ? JSON.parse(saved) : INITIAL_QUOTES;
  }
  const { data, error } = await supabase
    .from('quotes')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data || []).map(mapQuoteFromDb);
}

export async function fetchQuoteByFolio(folio) {
  if (!isSupabaseConfigured) {
    const saved = localStorage.getItem('gpl_quotes');
    const quotes = saved ? JSON.parse(saved) : INITIAL_QUOTES;
    return quotes.find(q => q.id.toLowerCase() === folio.toLowerCase()) || null;
  }
  const { data, error } = await supabase
    .from('quotes')
    .select('*')
    .ilike('id', folio)
    .maybeSingle();
  if (error) throw error;
  return data ? mapQuoteFromDb(data) : null;
}

export async function createQuote(quote) {
  if (!isSupabaseConfigured) {
    const saved = localStorage.getItem('gpl_quotes');
    const quotes = saved ? JSON.parse(saved) : INITIAL_QUOTES;
    quotes.unshift(quote);
    localStorage.setItem('gpl_quotes', JSON.stringify(quotes));
    return quote;
  }
  const row = mapQuoteToDb(quote);
  const { data, error } = await supabase
    .from('quotes')
    .insert(row)
    .select()
    .single();
  if (error) throw error;
  return mapQuoteFromDb(data);
}

export async function updateQuote(quote) {
  if (!isSupabaseConfigured) {
    const saved = localStorage.getItem('gpl_quotes');
    const quotes = saved ? JSON.parse(saved) : [];
    const updated = quotes.map(q => q.id === quote.id ? quote : q);
    localStorage.setItem('gpl_quotes', JSON.stringify(updated));
    return quote;
  }
  const row = mapQuoteToDb(quote);
  const { id, ...updates } = row;
  const { data, error } = await supabase
    .from('quotes')
    .update(updates)
    .eq('id', quote.id)
    .select()
    .single();
  if (error) throw error;
  return mapQuoteFromDb(data);
}

export async function deleteQuote(id) {
  if (!isSupabaseConfigured) {
    const saved = localStorage.getItem('gpl_quotes');
    const quotes = saved ? JSON.parse(saved) : [];
    const updated = quotes.filter(q => q.id !== id);
    localStorage.setItem('gpl_quotes', JSON.stringify(updated));
    return;
  }
  const { error } = await supabase
    .from('quotes')
    .delete()
    .eq('id', id);
  if (error) throw error;
}

function mapQuoteFromDb(row) {
  return {
    id: row.id,
    clientCompany: row.client_company,
    contactName: row.contact_name,
    phone: row.phone || '',
    email: row.email || '',
    origin: row.origin,
    destination: row.destination,
    unitType: row.unit_type,
    cargoType: row.cargo_type || '',
    weightTon: Number(row.weight_ton) || 0,
    dateRequired: row.date_required || '',
    status: row.status,
    carrierCost: Number(row.carrier_cost) || 0,
    marginPercent: Number(row.margin_percent) || 20,
    finalPrice: Number(row.final_price) || 0,
    driverName: row.driver_name || '',
    truckPlate: row.truck_plate || '',
    currentLocation: row.current_location || '',
    eta: row.eta || '',
    trackingHistory: row.tracking_history || [],
    timeRequired: row.time_required || '',
    originAddress: row.origin_address || '',
    destinationAddress: row.destination_address || '',
    instructions: row.instructions || '',
    createdAt: row.created_at
  };
}

function mapQuoteToDb(quote) {
  return {
    id: quote.id,
    client_company: quote.clientCompany,
    contact_name: quote.contactName,
    phone: quote.phone,
    email: quote.email,
    origin: quote.origin,
    destination: quote.destination,
    unit_type: quote.unitType,
    cargo_type: quote.cargoType,
    weight_ton: quote.weightTon,
    date_required: quote.dateRequired || null,
    status: quote.status,
    carrier_cost: quote.carrierCost,
    margin_percent: quote.marginPercent,
    final_price: quote.finalPrice,
    driver_name: quote.driverName,
    truck_plate: quote.truckPlate,
    current_location: quote.currentLocation,
    eta: quote.eta,
    tracking_history: quote.trackingHistory || [],
    time_required: quote.timeRequired || '',
    origin_address: quote.originAddress || '',
    destination_address: quote.destinationAddress || '',
    instructions: quote.instructions || ''
  };
}

// ============================================================
// CARRIERS
// ============================================================

export async function fetchCarriers() {
  if (!isSupabaseConfigured) {
    const saved = localStorage.getItem('gpl_carriers');
    return saved ? JSON.parse(saved) : INITIAL_CARRIERS;
  }
  const { data, error } = await supabase
    .from('carriers')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data || []).map(mapCarrierFromDb);
}

export async function createCarrier(carrier) {
  if (!isSupabaseConfigured) {
    const saved = localStorage.getItem('gpl_carriers');
    const carriers = saved ? JSON.parse(saved) : INITIAL_CARRIERS;
    carriers.unshift(carrier);
    localStorage.setItem('gpl_carriers', JSON.stringify(carriers));
    return carrier;
  }
  const row = mapCarrierToDb(carrier);
  const { data, error } = await supabase
    .from('carriers')
    .insert(row)
    .select()
    .single();
  if (error) throw error;
  return mapCarrierFromDb(data);
}

function mapCarrierFromDb(row) {
  return {
    id: row.id,
    companyName: row.company_name,
    baseCity: row.base_city || '',
    units: row.units || [],
    contactName: row.contact_name || '',
    phone: row.phone || '',
    sctPermit: row.sct_permit || '',
    insuranceValid: row.insurance_valid,
    gpsActive: row.gps_active,
    rating: Number(row.rating) || 5.0
  };
}

function mapCarrierToDb(carrier) {
  return {
    id: carrier.id,
    company_name: carrier.companyName,
    base_city: carrier.baseCity,
    units: Array.isArray(carrier.units) ? carrier.units : carrier.units.split(',').map(u => u.trim()),
    contact_name: carrier.contactName,
    phone: carrier.phone,
    sct_permit: carrier.sctPermit,
    insurance_valid: carrier.insuranceValid ?? true,
    gps_active: carrier.gpsActive ?? true,
    rating: carrier.rating ?? 5.0
  };
}

// ============================================================
// ANALYTICS & SECURITY
// ============================================================

export async function fetchAnalyticsEvents() {
  if (!isSupabaseConfigured) {
    const saved = localStorage.getItem('gpl_analytics_events');
    return saved ? JSON.parse(saved) : [];
  }
  const { data, error } = await supabase
    .from('analytics_events')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(500);
  if (error) {
    console.warn('Supabase analytics fetch warning:', error.message);
    const saved = localStorage.getItem('gpl_analytics_events');
    return saved ? JSON.parse(saved) : [];
  }
  return data || [];
}

export async function recordAnalyticsEvent(event) {
  const localSaved = localStorage.getItem('gpl_analytics_events');
  const events = localSaved ? JSON.parse(localSaved) : [];
  const fullEvent = {
    id: crypto.randomUUID ? crypto.randomUUID() : String(Date.now()),
    session_id: event.sessionId,
    event_type: event.eventType,
    event_data: event.eventData || {},
    ip_address: event.ipAddress || '187.190.44.12',
    country: event.country || 'México',
    city: event.city || 'Monterrey',
    device: event.device || 'Desktop',
    browser: event.browser || 'Chrome',
    referrer: event.referrer || '',
    created_at: new Date().toISOString()
  };
  events.unshift(fullEvent);
  if (events.length > 300) events.length = 300;
  localStorage.setItem('gpl_analytics_events', JSON.stringify(events));

  if (isSupabaseConfigured) {
    try {
      await supabase.from('analytics_events').insert({
        session_id: fullEvent.session_id,
        event_type: fullEvent.event_type,
        event_data: fullEvent.event_data,
        ip_address: fullEvent.ip_address,
        country: fullEvent.country,
        city: fullEvent.city,
        device: fullEvent.device,
        browser: fullEvent.browser,
        referrer: fullEvent.referrer
      });
    } catch (e) {
      console.warn('Analytics insert error:', e);
    }
  }
  return fullEvent;
}

export async function fetchSecurityEvents() {
  if (!isSupabaseConfigured) {
    const saved = localStorage.getItem('gpl_security_events');
    return saved ? JSON.parse(saved) : [];
  }
  const { data, error } = await supabase
    .from('security_events')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(200);
  if (error) {
    console.warn('Supabase security fetch warning:', error.message);
    const saved = localStorage.getItem('gpl_security_events');
    return saved ? JSON.parse(saved) : [];
  }
  return data || [];
}

export async function recordSecurityEvent(event) {
  const localSaved = localStorage.getItem('gpl_security_events');
  const events = localSaved ? JSON.parse(localSaved) : [];
  const fullEvent = {
    id: crypto.randomUUID ? crypto.randomUUID() : String(Date.now()),
    event_type: event.eventType,
    ip_address: event.ipAddress || 'Unknown',
    details: event.details || {},
    severity: event.severity || 'low',
    resolved: false,
    created_at: new Date().toISOString()
  };
  events.unshift(fullEvent);
  if (events.length > 200) events.length = 200;
  localStorage.setItem('gpl_security_events', JSON.stringify(events));

  if (isSupabaseConfigured) {
    try {
      await supabase.from('security_events').insert({
        event_type: fullEvent.event_type,
        ip_address: fullEvent.ip_address,
        details: fullEvent.details,
        severity: fullEvent.severity
      });
    } catch (e) {
      console.warn('Security event insert error:', e);
    }
  }
  return fullEvent;
}

export async function fetchBlockedIps() {
  if (!isSupabaseConfigured) {
    const saved = localStorage.getItem('gpl_blocked_ips');
    return saved ? JSON.parse(saved) : [];
  }
  const { data, error } = await supabase
    .from('blocked_ips')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) {
    const saved = localStorage.getItem('gpl_blocked_ips');
    return saved ? JSON.parse(saved) : [];
  }
  return data || [];
}

export async function blockIp(ipAddress, reason = 'Bloqueado por Administrador') {
  const localSaved = localStorage.getItem('gpl_blocked_ips');
  const list = localSaved ? JSON.parse(localSaved) : [];
  if (!list.find(item => item.ip_address === ipAddress)) {
    list.unshift({
      id: crypto.randomUUID ? crypto.randomUUID() : String(Date.now()),
      ip_address: ipAddress,
      reason,
      created_at: new Date().toISOString()
    });
    localStorage.setItem('gpl_blocked_ips', JSON.stringify(list));
  }

  if (isSupabaseConfigured) {
    try {
      await supabase.from('blocked_ips').insert({
        ip_address: ipAddress,
        reason
      });
    } catch (e) {
      console.warn('Block IP error:', e);
    }
  }
}

export async function unblockIp(ipAddress) {
  const localSaved = localStorage.getItem('gpl_blocked_ips');
  const list = localSaved ? JSON.parse(localSaved) : [];
  const filtered = list.filter(item => item.ip_address !== ipAddress);
  localStorage.setItem('gpl_blocked_ips', JSON.stringify(filtered));

  if (isSupabaseConfigured) {
    try {
      await supabase.from('blocked_ips').delete().eq('ip_address', ipAddress);
    } catch (e) {
      console.warn('Unblock IP error:', e);
    }
  }
}
