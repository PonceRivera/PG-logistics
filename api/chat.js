import { createClient } from '@supabase/supabase-js';

// Conectar a Supabase desde el servidor (seguro)
function getSupabase() {
  const url = process.env.VITE_SUPABASE_URL;
  const key = process.env.VITE_SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  return createClient(url, key);
}

// Buscar folios GPL-XXXX en el mensaje del usuario
function extractFolios(messages) {
  const folios = [];
  for (const msg of messages) {
    if (msg.role === 'user') {
      const matches = msg.content.match(/GPL-\d{3,5}/gi);
      if (matches) folios.push(...matches.map(f => f.toUpperCase()));
    }
  }
  return [...new Set(folios)];
}

// Traducir estatus a texto legible
function translateStatus(status) {
  const map = {
    PENDIENTE: 'Pendiente — En evaluación, aún no tiene precio asignado.',
    CONFIRMADO: 'Confirmado — Se ha asignado tarifa y unidad.',
    EN_TRANSITO: 'En Tránsito — La unidad va en camino.',
    ENTREGADO: 'Entregado — La mercancía fue recibida en destino.',
  };
  return map[status] || status;
}

// Construir contexto con datos reales del embarque
function buildShipmentContext(quotes) {
  if (!quotes || quotes.length === 0) return '';

  let context = '\n\n--- DATOS REALES DE EMBARQUES (usa esta información para responder) ---\n';
  
  for (const q of quotes) {
    context += `\nFolio: ${q.id}`;
    context += `\nEmpresa: ${q.client_company}`;
    context += `\nContacto: ${q.contact_name}`;
    context += `\nRuta: ${q.origin} → ${q.destination}`;
    context += `\nUnidad: ${q.unit_type}`;
    context += `\nEstado: ${translateStatus(q.status)}`;
    
    if (q.driver_name) context += `\nOperador: ${q.driver_name}`;
    if (q.truck_plate) context += `\nPlacas: ${q.truck_plate}`;
    if (q.current_location) context += `\nUbicación actual: ${q.current_location}`;
    if (q.eta) context += `\nETA: ${q.eta}`;
    if (q.final_price && q.status !== 'PENDIENTE') context += `\nTarifa: $${q.final_price} MXN`;
    
    if (q.tracking_history && q.tracking_history.length > 0) {
      context += `\nÚltimas actualizaciones:`;
      const recent = q.tracking_history.slice(0, 5);
      for (const ev of recent) {
        const date = new Date(ev.timestamp).toLocaleString('es-MX', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
        context += `\n  - ${date}: ${ev.message}${ev.location ? ' (📍 ' + ev.location + ')' : ''}`;
      }
    }
    context += '\n';
  }
  
  context += '--- FIN DE DATOS REALES ---\n';
  return context;
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  try {
    const { messages: userMessages = [] } = req.body;

    // Buscar si el usuario mencionó algún folio
    const folios = extractFolios(userMessages);
    let shipmentContext = '';

    if (folios.length > 0) {
      try {
        const supabase = getSupabase();
        if (supabase) {
          const { data } = await supabase
            .from('quotes')
            .select('*')
            .in('id', folios);
          
          if (data && data.length > 0) {
            shipmentContext = buildShipmentContext(data);
          } else {
            shipmentContext = `\n\n--- No se encontraron embarques con los folios: ${folios.join(', ')}. Dile al cliente que verifique su número de folio. ---\n`;
          }
        }
      } catch (dbErr) {
        console.error('Supabase error:', dbErr);
      }
    }

    // System Prompt mejorado con capacidades de servicio al cliente
    const systemPrompt = {
      role: 'system',
      content: `Eres el Asistente Virtual de Servicio al Cliente de GP Logistics (Grupo Ponce Logistics). 
Eres amable, profesional y conciso. 
Tienes DOS funciones principales:

## 1. INFORMAR sobre GP Logistics
- Somos una empresa de intermediación logística (Freight Broker) basada en Coahuila y Nuevo León.
- NO contamos con unidades propias, actuamos como intermediarios con una red de transportistas verificados (tienen permiso SCT, GPS y seguro).
- Tipos de unidades: Cajas secas de 53 y 48 pies, plataformas, rabones y camionetas de 3.5 toneladas.
- Rutas principales: Monterrey, Saltillo, Ramos Arizpe, Apodaca, Laredo, Querétaro, CDMX.
- Proceso de cotización: Usar el botón "Solicitar cotización" en la web.
- Contacto directo: contacto@grupoponcelogistics.com
- Horario de atención: Lunes a Viernes de 8:00 a 18:00, Sábados de 8:00 a 13:00.

## 2. SERVICIO AL CLIENTE (Rastreo y Soporte)
- Si el cliente te da un número de folio (formato GPL-XXXX), podrás consultar el estado real de su embarque.
- Si hay datos del embarque adjuntos abajo, úsalos para dar información precisa al cliente.
- Puedes informar: estatus, ruta, operador, placas, ubicación actual, ETA y las últimas actualizaciones de la bitácora.
- Si el folio NO se encontró, dile amablemente que verifique el número o que contacte por correo.
- Si el cliente tiene una queja o problema urgente que tú no puedes resolver, escala al correo: contacto@grupoponcelogistics.com

## Reglas:
- No inventes tarifas. Di que las tarifas varían según el mercado y que soliciten una cotización formal.
- No compartas información financiera interna (costo del fletero, márgenes, utilidades).
- Sé breve: máximo 2-3 párrafos cortos.
- Habla siempre en español y en nombre de GP Logistics.
- Si no tienes la información que el cliente pide, sugiere contactar por correo.
${shipmentContext}`,
    };

    const apiKey = process.env.NVIDIA_API_KEY;

    if (!apiKey) {
      return res.status(500).json({ error: 'Falta la API Key en el servidor.' });
    }

    const response = await fetch('https://integrate.api.nvidia.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'meta/llama-3.1-70b-instruct',
        messages: [systemPrompt, ...userMessages],
        temperature: 0.2,
        max_tokens: 500,
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('NVIDIA API Error:', errorData);
      return res.status(502).json({ error: 'Error comunicando con la IA' });
    }

    const data = await response.json();
    return res.status(200).json(data);

  } catch (error) {
    console.error('Server error:', error);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
}
