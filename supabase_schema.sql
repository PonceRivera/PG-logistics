-- ============================================================
-- GP LOGISTICS — Schema de Base de Datos para Supabase
-- ============================================================
-- Instrucciones:
-- 1. Ve a tu proyecto en supabase.com
-- 2. Abre el SQL Editor (menú lateral)
-- 3. Pega todo este contenido y haz clic en "Run"
-- ============================================================

-- Tabla: Cotizaciones / Embarques
create table if not exists quotes (
  id text primary key,
  client_company text not null,
  contact_name text not null,
  phone text,
  email text,
  origin text not null,
  destination text not null,
  unit_type text not null,
  cargo_type text,
  weight_ton numeric default 0,
  date_required date,
  status text not null default 'PENDIENTE',
  carrier_cost numeric default 0,
  margin_percent numeric default 20,
  final_price numeric default 0,
  driver_name text default '',
  truck_plate text default '',
  current_location text default '',
  eta text default '',
  created_at timestamptz default now()
);

-- Tabla: Directorio de Transportistas
create table if not exists carriers (
  id text primary key,
  company_name text not null,
  base_city text,
  units text[] default '{}',
  contact_name text,
  phone text,
  sct_permit text default '',
  insurance_valid boolean default true,
  gps_active boolean default true,
  rating numeric default 5.0,
  created_at timestamptz default now()
);

-- ============================================================
-- Row Level Security (RLS) — Permisos de acceso
-- ============================================================

-- Activar RLS en ambas tablas
alter table quotes enable row level security;
alter table carriers enable row level security;

-- QUOTES: Lectura pública (necesario para rastreo por folio)
create policy "Lectura publica de cotizaciones"
  on quotes for select
  using (true);

-- QUOTES: Inserción pública (clientes pueden enviar solicitudes)
create policy "Clientes pueden crear cotizaciones"
  on quotes for insert
  with check (true);

-- QUOTES: Solo admin puede actualizar (cambiar estatus, asignar tarifa)
create policy "Admin puede actualizar cotizaciones"
  on quotes for update
  using (auth.role() = 'authenticated');

-- QUOTES: Solo admin puede eliminar
create policy "Admin puede eliminar cotizaciones"
  on quotes for delete
  using (auth.role() = 'authenticated');

-- CARRIERS: Todo requiere autenticación (solo admin)
create policy "Admin puede ver transportistas"
  on carriers for select
  using (auth.role() = 'authenticated');

create policy "Admin puede crear transportistas"
  on carriers for insert
  with check (auth.role() = 'authenticated');

create policy "Admin puede actualizar transportistas"
  on carriers for update
  using (auth.role() = 'authenticated');

create policy "Admin puede eliminar transportistas"
  on carriers for delete
  using (auth.role() = 'authenticated');

-- ============================================================
-- Datos iniciales de ejemplo (opcional)
-- ============================================================

insert into carriers (id, company_name, base_city, units, contact_name, phone, sct_permit, rating) values
  ('CAR-01', 'Transportes del Norte S.A. de C.V.', 'Monterrey, NL', ARRAY['Caja 53"', 'Caja 48"'], 'Fernando Elizondo', '8183332211', 'SCT-NL-84910', 4.9),
  ('CAR-02', 'Fletes Express Coahuila', 'Saltillo, Coah', ARRAY['Rabón 10t', 'Torton 15t', '3.5 Ton'], 'Gonzalo Peralta', '8444112233', 'SCT-COAH-44120', 4.8),
  ('CAR-03', 'Logística Regiomontana de Carga', 'Apodaca, NL', ARRAY['Plataforma 48"', 'Cama Baja'], 'Héctor Salazar', '8119998877', 'SCT-NL-10293', 5.0)
on conflict (id) do nothing;
