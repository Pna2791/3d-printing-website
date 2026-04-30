# Backend Design

## Modules
- auth
- printers
- materials
- pricing
- orders
- stl-processing

## Folder Structure
/lib
  /supabase
  /utils
/services
  printerService.ts
  pricingService.ts
  stlService.ts

## Responsibilities

### Printer Module
- Track status (ready, busy, maintenance)
- Provide realtime updates

### Material Module
- Manage material types and pricing

### Pricing Module
- Calculate cost based on:
  - volume
  - material
  - machine time

### STL Module
- Parse STL
- Calculate:
  - volume
  - bounding box
  