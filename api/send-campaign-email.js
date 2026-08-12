import { createClient } from '@supabase/supabase-js';
import nodemailer from 'nodemailer';

// Helper for Supabase (Server-side)
function getSupabase() {
  const url = process.env.VITE_SUPABASE_URL;
  const key = process.env.VITE_SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  return createClient(url, key);
}

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
    const smtpUser = process.env.SMTP_USER;
    const smtpPass = process.env.SMTP_PASS;

    if (!apiKey) return res.status(500).json({ error: 'Falta la API Key de NVIDIA.' });
    if (!smtpUser || !smtpPass) return res.status(500).json({ error: 'Falta configuración SMTP (SMTP_USER, SMTP_PASS).' });

    // 1. Generate High-Conversion Email Content with NVIDIA
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
- Web: https://ponces-logistics.com/
- Correo: contacto@grupoponcelogistics.com
- Somos una agencia integradora de servicios logísticos con base en el norte de México.
- Estamos buscando alianzas con líneas de transporte para asignarles volúmenes de carga de nuestros clientes.

OBJETIVO:
- Proponerles alianza comercial.
- Queremos saber sus tarifas base y disponibilidad de unidades (cajas secas, plataformas).

REGLAS OBLIGATORIAS:
- NUNCA propongas llamadas telefónicas, sesiones, videollamadas, reuniones presenciales ni agenda una cita.
- Toda comunicación debe ser por CORREO ELECTRÓNICO únicamente.
- En lugar de "agendemos una llamada" usa frases como: "quedo al pendiente de su respuesta por este medio" o "le agradezco me comparta la información vía correo".

INSTRUCCIONES DE FORMATO:
- Genera SOLO el cuerpo del correo.
- Tono: Muy profesional.
- Largo: 3 párrafos máximo.
- Termina con la firma: Christopher Ponce Rivera | Dirección Comercial | GP Logistics | https://ponces-logistics.com/`;
    } else if (companyType === 'cliente_followup') {
      prompt = `Genera un correo de SEGUIMIENTO (Follow-up) corto y muy cortés de ventas B2B en español para un cliente potencial manufacturero o comercial que no ha respondido al correo anterior.

DATOS:
- Empresa destino: ${companyName}
- Contacto: ${contactName || 'Gerente de Logística'}

CONTEXTO:
- Empresa: GP Logistics
- Director Comercial: Christopher Ponce Rivera
- Web: https://ponces-logistics.com/

OBJETIVO DEL SEGUIMIENTO:
- Breve recordatorio de 2 párrafos máximo.
- Preguntar si tienen alguna ruta activa esta semana saliendo de Monterrey, Saltillo, Ramos Arizpe, Guadalajara, CDMX o Laredo donde requieran unidades de respaldo (caja seca 40/53', plataformas, rabones) o quieran comparar tarifas con su flete actual.
- Cierre sin fricción: "¿Les serviría que les enviemos una cotización comparativa sin compromiso por este medio?"

REGLAS OBLIGATORIAS:
- NUNCA propongas llamadas telefónicas, sesiones, videollamadas ni citas presenciales.
- Toda comunicación por correo electrónico únicamente.

INSTRUCCIONES DE FORMATO:
- Genera SOLO el cuerpo del correo.
- Tono: Muy amable, directo, breve (máximo 2 párrafos).
- Termina con la firma: Christopher Ponce Rivera | Dirección Comercial | GP Logistics | https://ponces-logistics.com/`;
    } else {
      // CLIENTE PRIMER CONTACTO - ALTO GANCHO DE CONVERSIÓN
      prompt = `Genera un correo de ventas B2B de ALTO GANCHO DE CONVERSIÓN en español para enviar a un Gerente de Logística/Tráfico/Compras de una empresa manufacturera o comercial.

DATOS:
- Empresa destino: ${companyName}
- Contacto: ${contactName || 'Gerente de Logística/Tráfico/Compras'}
- Giro/Notas: ${notes || 'Sector industrial'}

CONTEXTO DE QUIÉN ENVÍA:
- Empresa: GP Logistics (Grupo Ponce Logistics)
- Director Comercial: Christopher Ponce Rivera
- Web: https://ponces-logistics.com/

GANCHO Y PROPUESTA DE VALOR:
- Atacar directamente el problema de disponibilidad de camiones y tarifas altas en rutas críticas.
- Ofrecer solución: Unidades de respaldo con asignación garantizada (cajas secas 40 y 53', plataformas, rabones) con rastreo GPS en tiempo real en los corredores Monterrey, Saltillo, Ramos Arizpe, Laredo, CDMX y Guadalajara.
- Garantizar cotización comparativa en menos de 15 minutos sin ningún compromiso.

PREGUNTA DE CIERRE SIN FRICCIÓN:
- Finaliza con la pregunta: "¿Tendrán alguna carga o ruta activa esta semana donde requieran una unidad de respaldo o les sirva recibir una cotización comparativa sin compromiso?"

REGLAS OBLIGATORIAS:
- NUNCA propongas llamadas telefónicas, sesiones, videollamadas ni agendar citas.
- Toda comunicación debe ser por CORREO ELECTRÓNICO únicamente.
- En lugar de "agendemos una llamada" usa siempre "quedo al pendiente de su respuesta por este medio".

INSTRUCCIONES DE FORMATO:
- Genera SOLO el cuerpo del correo (sin etiquetas de asunto dentro del texto).
- Tono: Profesional, directo al grano, enfocado en solucionar problemas de transporte.
- Largo: Máximo 2 a 3 párrafos cortos (menos de 120 palabras).
- Termina con la firma: Christopher Ponce Rivera | Dirección Comercial | GP Logistics | https://ponces-logistics.com/`;
    }

    // Call NVIDIA for Body
    const bodyRes = await fetch('https://integrate.api.nvidia.com/v1/chat/completions', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'meta/llama-3.1-70b-instruct',
        messages: [{ role: 'system', content: 'Eres un redactor experto en correos fríos B2B de alta conversión para logística en México.' }, { role: 'user', content: prompt }],
        temperature: 0.6,
        max_tokens: 600,
      }),
    });
    if (!bodyRes.ok) throw new Error('Error generando cuerpo del correo');
    const bodyData = await bodyRes.json();
    const emailBody = bodyData.choices?.[0]?.message?.content || '';

    // Call NVIDIA for Subject
    let subjectPrompt = `Genera UN SOLO asunto de correo corto (máximo 8 palabras) enfocado en resolver fallas de flete a "${companyName}". Ejemplo: "Disponibilidad de fletes y unidades de respaldo en ${companyName}". Solo el texto.`;
    if (companyType === 'fletera') {
      subjectPrompt = `Genera UN SOLO asunto de correo (máximo 8 palabras) para proponer alianza de transporte a "${companyName}". Solo el texto.`;
    } else if (companyType === 'cliente_followup') {
      subjectPrompt = `Genera UN SOLO asunto de seguimiento corto tipo "Re: Fletes y unidades disponibles para ${companyName}". Solo el texto.`;
    }

    const subRes = await fetch('https://integrate.api.nvidia.com/v1/chat/completions', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'meta/llama-3.1-70b-instruct',
        messages: [{ role: 'system', content: 'Responde SOLO el asunto.' }, { role: 'user', content: subjectPrompt }],
        temperature: 0.5,
        max_tokens: 50,
      }),
    });
    
    let subject = companyType === 'fletera' 
      ? `Propuesta de Alianza Comercial - GP Logistics` 
      : (companyType === 'cliente_followup' ? `Re: Fletes y unidades disponibles para ${companyName}` : `Unidades de respaldo y cotización de fletes - ${companyName}`);
    
    if (subRes.ok) {
      const subData = await subRes.json();
      const generated = subData.choices?.[0]?.message?.content?.trim();
      if (generated && generated.length > 3) subject = generated.replace(/^["']|["']$/g, '');
    }

    // 2. Send Email with Nodemailer
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: smtpUser,
        pass: smtpPass,
      }
    });

    const htmlBody = emailBody.replace(/\n/g, '<br>');

    await transporter.sendMail({
      from: `"Christopher Ponce | GP Logistics" <${smtpUser}>`,
      to: email,
      subject: subject,
      html: `<div style="font-family: Arial, sans-serif; font-size: 14px; color: #333; line-height: 1.6;">${htmlBody}</div>`,
    });

    // 3. Save to Supabase History (if configured)
    const supabase = getSupabase();
    if (supabase) {
      await supabase.from('email_campaigns').insert({
        company: companyName,
        email: email,
        type: companyType,
        subject: subject,
        status: 'ENVIADO',
      });
    }

    return res.status(200).json({ success: true, subject });

  } catch (error) {
    console.error('Campaign error:', error);
    return res.status(500).json({ error: error.message || 'Error enviando el correo de campaña' });
  }
}
