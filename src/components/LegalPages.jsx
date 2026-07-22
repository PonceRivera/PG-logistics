import React from 'react';

export default function LegalPages({ activeTab }) {
  return (
    <div className="page-content">
      <div style={{ maxWidth: '780px' }}>

        {/* === TÉRMINOS Y CONDICIONES === */}
        {activeTab === 'terminos' && (
          <>
            <div className="section-header" style={{ marginTop: '0.5rem' }}>
              <p className="section-overline">Documento legal</p>
              <h1 className="section-title">Términos y Condiciones del Servicio</h1>
              <p className="section-subtitle">Última actualización: Julio 2026</p>
            </div>

            <div className="legal-content">
              <h3>1. Identificación del prestador</h3>
              <p>
                <strong>Grupo Ponce Logistics ("GP Logistics")</strong> es una empresa de intermediación logística digital
                con domicilio operativo en el estado de Coahuila, México. GP Logistics actúa exclusivamente como
                <strong> intermediario comercial entre el embarcador (cliente) y la línea de transporte (transportista)</strong>,
                sin operar unidades de transporte propias.
              </p>

              <h3>2. Objeto del servicio</h3>
              <p>
                GP Logistics presta servicios de intermediación logística que consisten en:
              </p>
              <ul>
                <li>Gestión de cotizaciones de fletes de carga terrestre.</li>
                <li>Coordinación operativa entre el embarcador y el transportista asignado.</li>
                <li>Seguimiento y visibilidad del estado de los embarques.</li>
                <li>Facturación del servicio de intermediación conforme a la legislación fiscal vigente.</li>
              </ul>
              <p>
                GP Logistics <strong>no</strong> es transportista, no opera vehículos de carga y no emite permisos de
                autotransporte federal. Los servicios de transporte son ejecutados por terceros independientes verificados.
              </p>

              <h3>3. Alcance de la responsabilidad</h3>
              <p>
                GP Logistics se compromete a seleccionar transportistas que cuenten con:
              </p>
              <ul>
                <li>Permiso vigente de la Secretaría de Comunicaciones y Transportes (SCT) para autotransporte federal de carga.</li>
                <li>Póliza de seguro de responsabilidad civil y de carga vigente.</li>
                <li>Sistema de rastreo satelital (GPS) activo en las unidades asignadas.</li>
              </ul>
              <p>
                No obstante, GP Logistics <strong>no asume responsabilidad directa</strong> por siniestros, pérdidas,
                daños parciales o totales a la mercancía ocurridos durante el tránsito, los cuales serán atendidos
                conforme a la póliza de seguro del transportista responsable del viaje. GP Logistics brindará apoyo
                en la gestión del reclamo ante la aseguradora del transportista.
              </p>

              <h3>4. Cotización y tarifas</h3>
              <ul>
                <li>Las tarifas proporcionadas son <strong>estimados</strong> basados en las condiciones del mercado al momento de la solicitud.</li>
                <li>La tarifa final queda confirmada una vez que el cliente acepta la cotización formal enviada por correo electrónico.</li>
                <li>Las tarifas están expresadas en <strong>Pesos Mexicanos (MXN) más IVA (16%)</strong>, salvo que se indique expresamente lo contrario.</li>
                <li>Las tarifas no incluyen: maniobras de carga/descarga, estadías, almacenaje, seguros adicionales, ni impuestos especiales, a menos que se especifique en la cotización.</li>
              </ul>

              <h3>5. Obligaciones del cliente (embarcador)</h3>
              <ul>
                <li>Proporcionar información veraz y completa sobre la mercancía: tipo, peso, dimensiones y cualquier clasificación especial (peligrosa, perecedera, frágil).</li>
                <li>Tener la mercancía lista para carga en la fecha y hora acordadas.</li>
                <li>Proporcionar la documentación necesaria para el transporte (Carta Porte, pedimentos aduanales, etc.).</li>
                <li>Realizar el pago de la factura dentro del plazo acordado.</li>
              </ul>

              <h3>6. Condiciones de pago</h3>
              <ul>
                <li>Los pagos se realizarán mediante transferencia bancaria o depósito a la cuenta indicada en la factura CFDI emitida por GP Logistics.</li>
                <li>Plazo de pago estándar: <strong>15 días naturales</strong> a partir de la fecha de entrega del embarque y la recepción de evidencia de entrega (POD).</li>
                <li>En caso de retraso en el pago, GP Logistics se reserva el derecho de suspender servicios futuros.</li>
              </ul>

              <h3>7. Cancelaciones</h3>
              <ul>
                <li>El cliente podrá cancelar un servicio contratado sin cargo siempre que la cancelación se notifique con al menos <strong>12 horas de anticipación</strong> a la hora programada de carga.</li>
                <li>Cancelaciones con menor anticipación podrán generar un cargo por concepto de <strong>falso flete</strong> (parcial o total), conforme a lo pactado con el transportista.</li>
              </ul>

              <h3>8. Facturación fiscal</h3>
              <p>
                GP Logistics emitirá Comprobante Fiscal Digital por Internet (CFDI) por el servicio de intermediación
                logística prestado, conforme a las disposiciones del Servicio de Administración Tributaria (SAT).
                El complemento Carta Porte será emitido por el transportista que ejecute el viaje.
              </p>

              <h3>9. Legislación aplicable y jurisdicción</h3>
              <p>
                Los presentes Términos y Condiciones se rigen por las leyes de los Estados Unidos Mexicanos.
                Para cualquier controversia derivada de la interpretación o cumplimiento de los mismos,
                las partes se someten a la jurisdicción de los tribunales competentes del Estado de Coahuila de Zaragoza,
                renunciando a cualquier otro fuero que pudiera corresponderles.
              </p>

              <h3>10. Modificaciones</h3>
              <p>
                GP Logistics se reserva el derecho de modificar los presentes términos en cualquier momento.
                Las modificaciones entrarán en vigor a partir de su publicación en este sitio web.
                El uso continuado del servicio constituye la aceptación de los términos vigentes.
              </p>
            </div>
          </>
        )}

        {/* === AVISO DE PRIVACIDAD === */}
        {activeTab === 'privacidad' && (
          <>
            <div className="section-header" style={{ marginTop: '0.5rem' }}>
              <p className="section-overline">Documento legal</p>
              <h1 className="section-title">Aviso de Privacidad Integral</h1>
              <p className="section-subtitle">Conforme a la Ley Federal de Protección de Datos Personales en Posesión de los Particulares (LFPDPPP)</p>
            </div>

            <div className="legal-content">
              <h3>1. Responsable del tratamiento de datos</h3>
              <p>
                <strong>Grupo Ponce Logistics ("GP Logistics")</strong>, con domicilio operativo en el estado de Coahuila, México,
                y correo de contacto <strong>contacto@grupoponcelogistics.com</strong>, es responsable del tratamiento
                de los datos personales que usted nos proporcione, los cuales serán protegidos conforme a lo dispuesto
                por la Ley Federal de Protección de Datos Personales en Posesión de los Particulares (LFPDPPP) y su Reglamento.
              </p>

              <h3>2. Datos personales que recopilamos</h3>
              <p>Para la prestación de nuestros servicios de intermediación logística, podemos recopilar las siguientes categorías de datos personales:</p>
              <ul>
                <li><strong>Datos de identificación:</strong> Nombre completo, razón social, cargo.</li>
                <li><strong>Datos de contacto:</strong> Número de teléfono, correo electrónico corporativo, dirección de la empresa.</li>
                <li><strong>Datos fiscales:</strong> RFC y domicilio fiscal (para facturación).</li>
                <li><strong>Datos operativos:</strong> Información sobre las cargas, orígenes, destinos y características de la mercancía.</li>
              </ul>
              <p>
                <strong>No recopilamos datos personales sensibles</strong> (salud, origen étnico, creencias religiosas, orientación sexual, datos biométricos).
              </p>

              <h3>3. Finalidades del tratamiento</h3>
              <p>Sus datos personales serán utilizados para las siguientes finalidades <strong>primarias</strong> (necesarias para la prestación del servicio):</p>
              <ul>
                <li>Procesar y dar seguimiento a solicitudes de cotización de fletes.</li>
                <li>Coordinar la logística del transporte contratado.</li>
                <li>Emitir facturas (CFDI) y documentación fiscal.</li>
                <li>Comunicarnos con usted respecto al estado de sus embarques.</li>
                <li>Atender solicitudes de soporte o aclaraciones.</li>
              </ul>
              <p>Finalidades <strong>secundarias</strong> (no indispensables, pero útiles para mejorar nuestro servicio):</p>
              <ul>
                <li>Enviar comunicaciones comerciales, promociones o información sobre nuevos servicios.</li>
                <li>Realizar encuestas de satisfacción del servicio.</li>
              </ul>
              <p>
                Si usted no desea que sus datos sean tratados para finalidades secundarias, puede comunicarlo
                al correo <strong>contacto@grupoponcelogistics.com</strong> con el asunto "Oposición finalidades secundarias".
              </p>

              <h3>4. Transferencia de datos</h3>
              <p>
                Sus datos personales podrán ser compartidos con las líneas de transporte asignadas a su embarque,
                exclusivamente con la finalidad de ejecutar el servicio de transporte contratado (nombre de contacto
                en origen/destino, dirección de carga/descarga y teléfono de referencia).
              </p>
              <p>
                No realizamos transferencias de datos a terceros para fines publicitarios ni comercializamos bases de datos.
              </p>

              <h3>5. Derechos ARCO</h3>
              <p>
                Usted tiene derecho a <strong>Acceder, Rectificar, Cancelar u Oponerse (derechos ARCO)</strong> al
                tratamiento de sus datos personales. Para ejercer cualquiera de estos derechos, envíe una solicitud
                por escrito al correo <strong>contacto@grupoponcelogistics.com</strong> con el asunto "Ejercicio de Derechos ARCO",
                indicando:
              </p>
              <ul>
                <li>Nombre completo y datos de contacto para recibir respuesta.</li>
                <li>Descripción clara del derecho que desea ejercer.</li>
                <li>Cualquier documento que acredite su identidad o la representación legal.</li>
              </ul>
              <p>
                Daremos respuesta en un plazo máximo de <strong>20 días hábiles</strong> a partir de la recepción de la solicitud.
              </p>

              <h3>6. Uso de cookies y tecnologías de rastreo</h3>
              <p>
                Este sitio web utiliza <strong>almacenamiento local del navegador (localStorage)</strong> con fines
                exclusivamente funcionales: mantener el estado de las cotizaciones y configuraciones de la sesión.
                No utilizamos cookies de rastreo de terceros, píxeles de seguimiento ni tecnologías de perfilamiento publicitario.
              </p>

              <h3>7. Medidas de seguridad</h3>
              <p>
                GP Logistics implementa medidas de seguridad administrativas, técnicas y físicas razonables para
                proteger sus datos personales contra daño, pérdida, alteración, destrucción o uso no autorizado.
              </p>

              <h3>8. Modificaciones al aviso de privacidad</h3>
              <p>
                GP Logistics se reserva el derecho de modificar este Aviso de Privacidad en cualquier momento.
                Las modificaciones serán publicadas en esta misma página web. La fecha de última actualización
                se indicará en la parte superior del documento.
              </p>

              <h3>9. Contacto</h3>
              <p>
                Para cualquier consulta relacionada con el tratamiento de sus datos personales, puede contactarnos en:
                <br /><strong>contacto@grupoponcelogistics.com</strong>
              </p>
            </div>
          </>
        )}

        {/* === POLÍTICA DE COOKIES === */}
        {activeTab === 'cookies' && (
          <>
            <div className="section-header" style={{ marginTop: '0.5rem' }}>
              <p className="section-overline">Documento legal</p>
              <h1 className="section-title">Política de Cookies y Almacenamiento Local</h1>
              <p className="section-subtitle">Última actualización: Julio 2026</p>
            </div>

            <div className="legal-content">
              <h3>1. ¿Qué son las cookies?</h3>
              <p>
                Las cookies son pequeños archivos de texto que los sitios web almacenan en su dispositivo para
                recordar información sobre su visita. Existen distintos tipos según su finalidad: funcionales,
                analíticas y publicitarias.
              </p>

              <h3>2. Tecnologías que utilizamos</h3>
              <p>
                Este sitio web utiliza exclusivamente <strong>localStorage del navegador</strong> (almacenamiento local)
                con fines estrictamente funcionales:
              </p>
              <ul>
                <li><strong>gpl_quotes:</strong> Almacena temporalmente las solicitudes de cotización registradas durante la sesión.</li>
                <li><strong>gpl_carriers:</strong> Almacena temporalmente el directorio de transportistas del panel de administración.</li>
              </ul>
              <p>
                Estos datos se almacenan únicamente en su dispositivo y <strong>no se transmiten a servidores externos</strong>.
              </p>

              <h3>3. Cookies de terceros</h3>
              <p>
                Actualmente, <strong>no utilizamos cookies de terceros</strong> (Google Analytics, Facebook Pixel, etc.).
                En caso de implementar herramientas analíticas en el futuro, este documento será actualizado y se
                solicitará su consentimiento previo.
              </p>

              <h3>4. Cómo eliminar datos almacenados</h3>
              <p>
                Puede eliminar los datos almacenados localmente en cualquier momento a través de la configuración
                de su navegador: Configuración → Privacidad → Borrar datos de navegación → Almacenamiento local / Datos de sitios.
              </p>

              <h3>5. Contacto</h3>
              <p>
                Consultas sobre esta política: <strong>contacto@grupoponcelogistics.com</strong>
              </p>
            </div>
          </>
        )}

        {/* === DESLINDE DE RESPONSABILIDAD === */}
        {activeTab === 'deslinde' && (
          <>
            <div className="section-header" style={{ marginTop: '0.5rem' }}>
              <p className="section-overline">Documento legal</p>
              <h1 className="section-title">Deslinde de Responsabilidad</h1>
              <p className="section-subtitle">Última actualización: Julio 2026</p>
            </div>

            <div className="legal-content">
              <h3>1. Naturaleza del servicio</h3>
              <p>
                GP Logistics actúa exclusivamente como <strong>intermediario comercial</strong> entre el cliente
                (embarcador) y los transportistas independientes. No somos transportistas, no operamos vehículos
                de carga y no somos responsables directos de la ejecución física del servicio de transporte.
              </p>

              <h3>2. Responsabilidad sobre la mercancía</h3>
              <p>
                GP Logistics no asume responsabilidad por:
              </p>
              <ul>
                <li>Daños, pérdidas parciales o totales de la mercancía durante el transporte.</li>
                <li>Retrasos causados por condiciones climáticas, bloqueos carreteros, accidentes viales o causas de fuerza mayor.</li>
                <li>Mercancía no declarada correctamente por el cliente (peso, dimensiones, naturaleza, valor).</li>
                <li>Incumplimiento de normativas aduaneras o de comercio exterior por parte del cliente.</li>
              </ul>

              <h3>3. Cobertura de seguros</h3>
              <p>
                Todos los transportistas aliados a GP Logistics cuentan con póliza de seguro de carga vigente.
                En caso de siniestro, GP Logistics apoyará en la gestión del reclamo ante la aseguradora del
                transportista, pero <strong>la indemnización será determinada y cubierta por la compañía aseguradora</strong>
                conforme a los términos de su póliza.
              </p>

              <h3>4. Información en el sitio web</h3>
              <p>
                La información publicada en este sitio web (tarifas estimadas, tiempos de tránsito, disponibilidad)
                es de carácter informativo y no constituye una oferta vinculante. Las condiciones finales del servicio
                quedan establecidas en la cotización formal enviada por correo electrónico.
              </p>

              <h3>5. Contacto</h3>
              <p>
                Consultas legales: <strong>contacto@grupoponcelogistics.com</strong>
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
