# API Design

## Public APIs

### GET /printers
- Return list of printers

### GET /materials
- Return material list

### POST /estimate
- Input: STL file + material_id
- Output: price estimation

## Admin APIs

### POST /printers
### PATCH /printers/:id
### POST /materials

## Realtime
- Subscribe to `printers` table changes