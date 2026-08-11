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

    // 1. Generate Email Content with NVIDIA
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
- Largo: 3-4 párrafos máximo.
- Termina con la firma: Christopher Ponce Rivera | Dirección Comercial | GP Logistics | https://ponces-logistics.com/`;
    } else {
      prompt = `Genera un correo electrónico profesional de ventas B2B en español para enviar a una empresa manufacturera o comercial.
DATOS:
- Empresa destino: ${companyName}
- Contacto: ${contactName || 'Gerente de Logística/Tráfico'}
- Notas adicionales: ${notes || 'Ninguna'}

CONTEXTO DE QUIÉN ENVÍA:
- Empresa: GP Logistics (Grupo Ponce Logistics)
- Director Comercial: Christopher Ponce Rivera
- Web: https://ponces-logistics.com/
- Correo: contacto@grupoponcelogistics.com
- Ofrecemos transporte terrestre con rastreo satelital en tiempo real, cotizador automático con IA.

OBJETIVO:
- Presentar GP Logistics.
- Ofrecer una cotización sin compromiso para sus embarques.

REGLAS OBLIGATORIAS:
- NUNCA propongas llamadas telefónicas, sesiones, videollamadas, reuniones presenciales ni agenda una cita.
- Toda comunicación debe ser por CORREO ELECTRÓNICO únicamente.
- En lugar de "agendemos una llamada" usa frases como: "quedo al pendiente de su respuesta por este medio" o "con gusto le enviamos una cotización por correo".

INSTRUCCIONES DE FORMATO:
- Genera SOLO el cuerpo del correo.
- Tono: Profesional, moderno.
- Largo: 3-4 párrafos máximo.
- Termina con la firma: Christopher Ponce Rivera | Dirección Comercial | GP Logistics | https://ponces-logistics.com/`;
    }

    // Call NVIDIA for Body
    const bodyRes = await fetch('https://integrate.api.nvidia.com/v1/chat/completions', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'meta/llama-3.1-70b-instruct',
        messages: [{ role: 'system', content: 'Eres un redactor B2B experto.' }, { role: 'user', content: prompt }],
        temperature: 0.7,
        max_tokens: 800,
      }),
    });
    if (!bodyRes.ok) throw new Error('Error generando cuerpo del correo');
    const bodyData = await bodyRes.json();
    const emailBody = bodyData.choices?.[0]?.message?.content || '';

    // Call NVIDIA for Subject
    const subjectPrompt = companyType === 'fletera'
      ? `Genera UN SOLO asunto de correo (máximo 10 palabras) para proponer alianza de transporte a "${companyName}". Solo el texto.`
      : `Genera UN SOLO asunto de correo (máximo 10 palabras) para ofrecer transporte de carga a "${companyName}". Solo el texto.`;

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
    
    let subject = companyType === 'fletera' ? `Propuesta de Alianza Comercial - GP Logistics` : `Soluciones en Transporte - GP Logistics`;
    if (subRes.ok) {
      const subData = await subRes.json();
      const generated = subData.choices?.[0]?.message?.content?.trim();
      if (generated && generated.length > 3) subject = generated.replace(/^["']|["']$/g, '');
    }

    // 2. Send Email with Nodemailer (Using Gmail as default setup)
    const transporter = nodemailer.createTransport({
      service: 'gmail', // Standard for Gmail. If Zoho, change to host: 'smtp.zoho.com', port: 465, secure: true
      auth: {
        user: smtpUser,
        pass: smtpPass,
      }
    });

    // Replace line breaks with <br> for HTML email
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
