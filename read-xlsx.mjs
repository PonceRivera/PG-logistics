import XLSX from 'xlsx';
import fs from 'fs';

const buf = fs.readFileSync('Clientes_Logistica_Norte_Mexico.xlsx');
const workbook = XLSX.read(buf);
const sheetName = workbook.SheetNames[0];
const data = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);

// Show headers and first 3 rows
console.log('=== HEADERS ===');
console.log(Object.keys(data[0] || {}));
console.log('\n=== FIRST 3 ROWS ===');
console.log(JSON.stringify(data.slice(0, 3), null, 2));
console.log('\n=== TOTAL ROWS ===', data.length);
