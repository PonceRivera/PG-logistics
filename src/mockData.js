export const INITIAL_QUOTES = [
  {
    id: "GPL-8492",
    clientCompany: "Industrias Metálicas del Norte",
    contactName: "Ing. Carlos Mendoza",
    phone: "8181234567",
    email: "cmendoza@indmetalicas.com",
    origin: "Ramos Arizpe, Coahuila",
    destination: "Apodaca, Nuevo León",
    unitType: "Caja Seca 53\"",
    cargoType: "Automotriz / Piezas Estampadas",
    weightTon: 18,
    dateRequired: "2026-07-25",
    status: "EN_TRANSITO", // PENDIENTE, COTIZADO, CONFIRMADO, EN_TRANSITO, ENTREGADO
    carrierCost: 14500,
    marginPercent: 20,
    finalPrice: 17400,
    createdAt: "2026-07-21T10:30:00Z",
    driverName: "Roberto Garza",
    truckPlate: "84-AA-2X",
    currentLocation: "Libramiento Saltillo-Monterrey Km 32",
    eta: "2026-07-22 14:00"
  },
  {
    id: "GPL-8493",
    clientCompany: "Plásticos de Saltillo S.A.",
    contactName: "Lic. Ana Sofia Ramos",
    phone: "8449876543",
    email: "aramos@plassaltillo.com.mx",
    origin: "Saltillo, Coahuila",
    destination: "Querétaro, QRO",
    unitType: "Caja Seca 48\"",
    cargoType: "Tarimas con Resina Plástica",
    weightTon: 14,
    dateRequired: "2026-07-26",
    status: "PENDIENTE",
    carrierCost: 0,
    marginPercent: 20,
    finalPrice: 0,
    createdAt: "2026-07-21T14:15:00Z",
    driverName: "",
    truckPlate: "",
    currentLocation: "",
    eta: ""
  },
  {
    id: "GPL-8490",
    clientCompany: "Maquiladora Ramos Express",
    contactName: "Ing. Javier Torres",
    phone: "8115554321",
    email: "jtorres@ramosexpress.com",
    origin: "Escobedo, Nuevo León",
    destination: "Torreón, Coahuila",
    unitType: "Rabón (10 Ton)",
    cargoType: "Refacciones y Herramental",
    weightTon: 8,
    dateRequired: "2026-07-20",
    status: "ENTREGADO",
    carrierCost: 9000,
    marginPercent: 22,
    finalPrice: 10980,
    createdAt: "2026-07-20T08:00:00Z",
    driverName: "Mariano Treviño",
    truckPlate: "92-BB-4Z",
    currentLocation: "Entregado en Almacén Torreón",
    eta: "Entregado"
  }
];

export const INITIAL_CARRIERS = [
  {
    id: "CAR-01",
    companyName: "Transportes del Norte S.A. de C.V.",
    baseCity: "Monterrey, NL",
    units: ["Caja 53\"", "Caja 48\""],
    contactName: "Don Fernando Elizondo",
    phone: "8183332211",
    sctPermit: "SCT-NL-84910",
    insuranceValid: true,
    gpsActive: true,
    rating: 4.9
  },
  {
    id: "CAR-02",
    companyName: "Fletes Express Coahuila",
    baseCity: "Saltillo, Coah",
    units: ["Rabón 10t", "Torton 15t", "3.5 Ton"],
    contactName: "Gonzalo Peralta",
    phone: "8444112233",
    sctPermit: "SCT-COAH-44120",
    insuranceValid: true,
    gpsActive: true,
    rating: 4.8
  },
  {
    id: "CAR-03",
    companyName: "Logística Regiomontana de Carga",
    baseCity: "Apodaca, NL",
    units: ["Plataforma 48\"", "Cama Baja"],
    contactName: "Ing. Héctor Salazar",
    phone: "8119998877",
    sctPermit: "SCT-NL-10293",
    insuranceValid: true,
    gpsActive: true,
    rating: 5.0
  }
];

export const HUBS = [
  "Monterrey, NL",
  "Saltillo, Coah",
  "Ramos Arizpe, Coah",
  "Apodaca, NL",
  "Escobedo, NL",
  "San Pedro Garza García, NL",
  "Santa Catarina, NL",
  "Guadalupe, NL",
  "Ciénega de Flores, NL",
  "Torreón, Coah",
  "Monclova, Coah",
  "Piedras Negras, Coah",
  "Nuevo Laredo, Tamps",
  "Querétaro, QRO",
  "San Luis Potosí, SLP",
  "Ciudad de México (CDMX)",
  "Guadalajara, Jal"
];

export const UNIT_TYPES = [
  { id: "caja53", name: 'Caja Seca 53"', capacity: "Hasta 24 Toneladas", baseKm: 32 },
  { id: "caja48", name: 'Caja Seca 48"', capacity: "Hasta 20 Toneladas", baseKm: 28 },
  { id: "plataforma", name: 'Plataforma 48"', capacity: "Hasta 25 Toneladas (Plana)", baseKm: 35 },
  { id: "rabon", name: "Rabón", capacity: "Hasta 8-10 Toneladas", baseKm: 22 },
  { id: "torton", name: "Torton", capacity: "Hasta 15 Toneladas", baseKm: 25 },
  { id: "camion35", name: "Camión 3.5t Express", capacity: "Hasta 3.5 Toneladas", baseKm: 16 }
];
