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

// Map DB snake_case → JS camelCase
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

// Map JS camelCase → DB snake_case
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
