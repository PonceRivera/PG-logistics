import XLSX from 'xlsx';
import fs from 'fs';

const buf = fs.readFileSync('Clientes_PYMES_Verificados_Norte.xlsx');
const workbook = XLSX.read(buf);
const sheetName = workbook.SheetNames[0];
const data = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);

const findCol = (row, ...keywords) => {
  for (const key of Object.keys(row)) {
    const lower = key.toLowerCase();
    if (keywords.some(kw => lower.includes(kw))) return row[key];
  }
  return '';
};

const newQueue = [];
data.forEach(row => {
  const name = findCol(row, 'empresa', 'company', 'nombre de la empresa');
  const mail = findCol(row, 'correo', 'email', 'e-mail');
  let rawEmail = String(mail).split('/')[0].trim();

  if (name && rawEmail && rawEmail.includes('@') && !rawEmail.includes('contacto via')) {
    newQueue.push({
      companyName: name,
      contactName: findCol(row, 'contacto', 'contact'),
      email: rawEmail,
      companyType: 'cliente',
      notes: `${findCol(row, 'giro', 'sector')} | Ruta: ${findCol(row, 'ruta')}`.trim(),
    });
  }
});

console.log(`✅ Extraídos ${newQueue.length} contactos válidos de ${data.length} filas.`);
console.log('\n--- MUESTRA DE DATOS PROCESADOS (PRIMEROS 5) ---');
console.log(JSON.stringify(newQueue.slice(0, 5), null, 2));
