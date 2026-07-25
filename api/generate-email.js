export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  try {
    const { companyName, contactName, email, companyType, notes } = req.body;

    if (!companyName || !email || !companyType) {
      return res.status(400).json({ error: 'Faltan campos requeridos' });
    }

    const apiKey = process.env.NVIDIA_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: 'Falta la API Key en el servidor.' });
    }

    // Determinar el tipo de correo a generar
    let prompt = '';

    if (companyType === 'fletera') {
      prompt = `Genera un correo electrónico profesional de ventas B2B en español para enviar a una empresa de transporte/fletera.

DATOS:
- Empresa destino: ${companyName}
- Contacto: ${contactName || 'Equipo de Ventas/Tráfico'}
- Notas adicionales: ${notes || 'Ninguna'}

CONTEXTO DE QUIÉN ENVÍA:
- Empresa: GP Logistics (Grupo Ponce Logistics)
- Director Comercial: Christopher Ponce Rivera
- Web: https://pg-logistics.vercel.app/
- Correo: contacto@grupoponcelogistics.com
- Somos una agencia integradora de servicios logísticos con base en el norte de México (Coahuila/Nuevo León).
- Estamos buscando alianzas con líneas de transporte para asignarles volúmenes de carga de nuestros clientes.
- Contamos con plataforma digital de gestión logística con rastreo GPS y cotizador automático.

OBJETIVO DEL CORREO:
- Proponerles una alianza comercial donde GP Logistics les asigne cargas/viajes de nuestros clientes.
- Queremos saber sus tarifas base, disponibilidad de unidades (cajas secas, plataformas) y requisitos para darlos de alta como proveedor.
- Pedir una llamada breve o respuesta por correo.

INSTRUCCIONES DE FORMATO:
- Genera SOLO el cuerpo del correo (sin "Asunto:" ni etiquetas).
- Tono: Muy profesional, corporativo, confiable. Que suene como una empresa grande.
- Largo: 3-4 párrafos máximo. Conciso pero contundente.
- NO uses palabras como "intermediario" o "comisionista", usa "agencia integradora" o "brazo comercial".
- Termina con la firma: Christopher Ponce Rivera | Dirección Comercial | GP Logistics | https://pg-logistics.vercel.app/`;
    } else {
      prompt = `Genera un correo electrónico profesional de ventas B2B en español para enviar a una empresa manufacturera o comercial que podría necesitar servicios de transporte de carga.

DATOS:
- Empresa destino: ${companyName}
- Contacto: ${contactName || 'Gerente de Logística/Tráfico'}
- Notas adicionales: ${notes || 'Ninguna'}

CONTEXTO DE QUIÉN ENVÍA:
- Empresa: GP Logistics (Grupo Ponce Logistics)
- Director Comercial: Christopher Ponce Rivera
- Web: https://pg-logistics.vercel.app/
- Correo: contacto@grupoponcelogistics.com
- Somos una agencia integradora de servicios logísticos con base en el norte de México.
- Ofrecemos transporte terrestre con rastreo satelital en tiempo real, cotizador automático con IA, y red de transportistas verificados.
- Tipos de unidad: Cajas secas 48/53 pies, plataformas, rabones, camionetas 3.5 ton.
- Rutas: Monterrey, Saltillo, Ramos Arizpe, Laredo, Querétaro, CDMX, Guadalajara y todo México.

OBJETIVO DEL CORREO:
- Presentar GP Logistics como proveedor de servicios de transporte terrestre.
- Destacar nuestra tecnología (plataforma digital, rastreo GPS, cotizador con IA).
- Ofrecer una cotización sin compromiso para sus próximos embarques.
- Solicitar una llamada o reunión breve.

INSTRUCCIONES DE FORMATO:
- Genera SOLO el cuerpo del correo (sin "Asunto:" ni etiquetas).
- Tono: Profesional, moderno, tecnológico. Que suene innovador y confiable.
- Largo: 3-4 párrafos máximo. Conciso pero contundente.
- Menciona al menos 1 ventaja competitiva única (rastreo GPS en tiempo real, cotizador automático).
- Termina con la firma: Christopher Ponce Rivera | Dirección Comercial | GP Logistics | https://pg-logistics.vercel.app/`;
    }

    const response = await fetch('https://integrate.api.nvidia.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'meta/llama-3.1-70b-instruct',
        messages: [
          { role: 'system', content: 'Eres un experto en redacción de correos corporativos de ventas B2B para empresas de logística en México. Escribes correos persuasivos, profesionales y concisos que generan respuestas.' },
          { role: 'user', content: prompt },
        ],
        temperature: 0.7,
        max_tokens: 800,
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('NVIDIA API Error:', errorData);
      return res.status(502).json({ error: 'Error comunicando con la IA' });
    }

    const data = await response.json();
    const emailBody = data.choices?.[0]?.message?.content || '';

    // Generar un asunto inteligente
    const subjectPrompt = companyType === 'fletera'
      ? `Genera UN SOLO asunto de correo profesional (máximo 10 palabras) para proponer una alianza de transporte a "${companyName}". Solo el texto del asunto, sin comillas ni etiquetas.`
      : `Genera UN SOLO asunto de correo profesional (máximo 10 palabras) para ofrecer servicios de transporte de carga a "${companyName}". Solo el texto del asunto, sin comillas ni etiquetas.`;

    const subjectResponse = await fetch('https://integrate.api.nvidia.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'meta/llama-3.1-70b-instruct',
        messages: [
          { role: 'system', content: 'Responde SOLO con el texto del asunto. Sin explicaciones ni comillas.' },
          { role: 'user', content: subjectPrompt },
        ],
        temperature: 0.5,
        max_tokens: 50,
      }),
    });

    let subject = companyType === 'fletera'
      ? `Propuesta de Alianza Comercial - GP Logistics`
      : `Soluciones en Transporte de Carga - GP Logistics`;

    if (subjectResponse.ok) {
      const subjectData = await subjectResponse.json();
      const generated = subjectData.choices?.[0]?.message?.content?.trim();
      if (generated && generated.length > 3 && generated.length < 100) {
        subject = generated.replace(/^["']|["']$/g, '');
      }
    }

    return res.status(200).json({ subject, body: emailBody });

  } catch (error) {
    console.error('Server error:', error);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
}
