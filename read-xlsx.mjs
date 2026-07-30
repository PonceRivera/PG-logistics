import XLSX from 'xlsx';
import fs from 'fs';

const buf = fs.readFileSync('Clientes_PYMES_Norte_Mexico.xlsx');
const workbook = XLSX.read(buf);
const sheetName = workbook.SheetNames[0];
const data = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);

console.log('=== HEADERS ===');
console.log(Object.keys(data[0] || {}));
console.log('\n=== FIRST 5 ROWS ===');
console.log(JSON.stringify(data.slice(0, 5), null, 2));
console.log('\n=== TOTAL ROWS ===', data.length);
