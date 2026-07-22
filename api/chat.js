export const config = {
  runtime: 'edge', // Usaremos el Edge Runtime de Vercel para que sea muy rápido
};

export default async function handler(req) {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Método no permitido' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const body = await req.json();
    const userMessages = body.messages || [];

    // System Prompt: El cerebro de la IA para GP Logistics
    const systemPrompt = {
      role: 'system',
      content: `Eres el Asistente Virtual de GP Logistics (Grupo Ponce Logistics). 
Eres amable, profesional y conciso. 
Tu objetivo es ayudar a los clientes a entender nuestros servicios y guiarlos a cotizar.

Información clave de GP Logistics:
- Somos una empresa de intermediación logística (Freight Broker) basada en Coahuila y Nuevo León.
- NO contamos con unidades propias, actuamos como intermediarios con una red de transportistas verificados (tienen permiso SCT, GPS y seguro).
- Tipos de unidades que manejamos: Cajas secas de 53 y 48 pies, plataformas, rabones y camionetas de 3.5 toneladas.
- Rutas principales: Monterrey, Saltillo, Ramos Arizpe, Apodaca, Laredo, Querétaro, CDMX.
- Proceso de cotización: El cliente debe usar el botón "Solicitar cotización" en nuestra web, llena los datos y recibe la tarifa formal por correo.
- Contacto directo: contacto@grupoponcelogistics.com

Reglas:
- No inventes tarifas. Di que las tarifas varían según el mercado y que soliciten una cotización formal en la web.
- Sé breve, respuestas de máximo 2-3 párrafos cortos.
- Habla siempre en nombre de GP Logistics.`,
    };

    // La API Key está guardada de forma segura en las variables de entorno de Vercel
    const apiKey = process.env.NVIDIA_API_KEY;

    if (!apiKey) {
      return new Response(JSON.stringify({ error: 'Falta la API Key en el servidor.' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const response = await fetch('https://integrate.api.nvidia.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'meta/llama-3.1-70b-instruct', // Modelo rápido y gratuito en NVIDIA NIM
        messages: [systemPrompt, ...userMessages],
        temperature: 0.2, // Respuestas más precisas y menos creativas
        max_tokens: 400,
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('NVIDIA API Error:', errorData);
      return new Response(JSON.stringify({ error: 'Error comunicando con la IA' }), {
        status: 502,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const data = await response.json();
    
    return new Response(JSON.stringify(data), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Server error:', error);
    return new Response(JSON.stringify({ error: 'Error interno del servidor' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
