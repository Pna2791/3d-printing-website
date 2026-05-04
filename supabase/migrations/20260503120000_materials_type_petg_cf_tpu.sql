-- Allow PETG-CF and TPU in materials.type (aligns with app SupportedMaterial / pricing).

ALTER TABLE public.materials DROP CONSTRAINT IF EXISTS materials_type_check;

ALTER TABLE public.materials
  ADD CONSTRAINT materials_type_check
  CHECK (type IN ('PLA', 'PETG', 'PETG-CF', 'TPU', 'ABS', 'Resin'));
