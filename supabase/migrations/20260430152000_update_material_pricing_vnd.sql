-- Update material pricing to new VND/gram business rules.
-- PLA: 600 VND/g, PETG: 400 VND/g

UPDATE public.materials
SET unit_price = 600
WHERE type = 'PLA';

UPDATE public.materials
SET unit_price = 400
WHERE type = 'PETG';

