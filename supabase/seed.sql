-- Seed data (idempotent). Run after migrations on your Supabase project.
-- Wrapped in a single transaction: all-or-nothing per run.
-- Does not insert orders (requires real auth.users).

BEGIN;

INSERT INTO public.materials (id, name, type, color, density, unit_price)
VALUES
  (
    '11111111-1111-1111-1111-111111111101',
    'Standard PLA',
    'PLA',
    'Natural',
    1.24,
    600
  ),
  (
    '11111111-1111-1111-1111-111111111102',
    'Tough PETG',
    'PETG',
    'Black',
    1.27,
    400
  ),
  (
    '11111111-1111-1111-1111-111111111103',
    'ABS Pro',
    'ABS',
    'Gray',
    1.04,
    0.08
  ),
  (
    '11111111-1111-1111-1111-111111111104',
    'Clear Resin',
    'Resin',
    'Clear',
    1.12,
    0.25
  )
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.printers (id, name, model, status, build_volume_x, build_volume_y, build_volume_z)
VALUES
  (
    '22222222-2222-2222-2222-222222222201',
    'Floor A — Primary',
    'Prusa XL',
    'ready',
    360,
    360,
    360
  ),
  (
    '22222222-2222-2222-2222-222222222202',
    'Floor A — Secondary',
    'Bambu X1C',
    'busy',
    256,
    256,
    256
  ),
  (
    '22222222-2222-2222-2222-222222222203',
    'Resin bay',
    'Form 3L',
    'maintenance',
    335,
    200,
    300
  )
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.pricing_rules (id, material_id, base_price, min_volume, discount_factor)
VALUES
  (
    '33333333-3333-3333-3333-333333333301',
    '11111111-1111-1111-1111-111111111101',
    5,
    0,
    1
  ),
  (
    '33333333-3333-3333-3333-333333333302',
    '11111111-1111-1111-1111-111111111102',
    6,
    0,
    1
  ),
  (
    '33333333-3333-3333-3333-333333333303',
    '11111111-1111-1111-1111-111111111103',
    7,
    0,
    0.95
  ),
  (
    '33333333-3333-3333-3333-333333333304',
    '11111111-1111-1111-1111-111111111104',
    15,
    0,
    1
  )
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.workshop_info (key, value)
VALUES
  ('workshop_name', 'Example 3D Workshop'),
  ('contact_email', 'hello@example.com'),
  ('timezone', 'UTC')
ON CONFLICT (key) DO UPDATE
SET value = excluded.value;

COMMIT;
