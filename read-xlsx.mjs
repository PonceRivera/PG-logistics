import XLSX from 'xlsx';
import fs from 'fs';

const buf = fs.readFileSync('Prospectos_Logistica_Norte_Mexico.xlsx');
const workbook = XLSX.read(buf);
const sheetName = workbook.SheetNames[0];
const data = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);

console.log(JSON.stringify(data, null, 2));
