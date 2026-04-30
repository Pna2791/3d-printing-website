# Database Schema

## printers
- id
- name
- model
- status (ready, busy, maintenance)
- build_volume_x
- build_volume_y
- build_volume_z

## materials
- id
- name
- type (PLA, PETG, ABS, Resin)
- color
- density
- unit_price

## pricing_rules
- id
- material_id
- base_price
- min_volume
- discount_factor

## workshop_info
- id
- key
- value

## orders
- id
- user_id
- status
- total_price
- estimated_delivery
