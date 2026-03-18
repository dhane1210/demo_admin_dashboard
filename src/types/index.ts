/* ── Shipment Types ─────────────────────────────── */

export interface Shipment {
  id: string
  shipment_number: string | null
  shipment_type: string | null
  bl_number: string | null
  booking_number: string | null
  customer_id: string | null
  customer_name: string | null
  shipper: string | null
  consignee: string | null
  sealine: string | null
  sealine_name: string | null
  status: string
  shipping_status: string | null
  gross_weight: number | null
  cbm: number | null
  package_count: number | null
  package_type: string | null
  commodity: string | null
  incoterm: string | null
  pickup_location: string | null
  delivery_location: string | null
  pol_name: string | null
  pol_locode: string | null
  pol_country: string | null
  pod_name: string | null
  pod_locode: string | null
  pod_country: string | null
  etd: string | null
  eta: string | null
  ata: string | null
  atd: string | null
  predictive_eta: string | null
  cutoff_date: string | null
  delivery_deadline: string | null
  vessel_name: string | null
  vessel_imo: number | null
  vessel_mmsi: number | null
  last_event: string | null
  last_event_date: string | null
  last_vessel_lat: number | null
  last_vessel_lng: number | null
  last_vessel_update: string | null
  notes: string | null
  admin_notes: string | null
  last_synced_at: string | null
  created_at: string
  updated_at: string
  raw_api_response?: any
  containers?: Container[]
  events?: ContainerEvent[]
}

export interface Container {
  id: string
  shipment_id: string
  number: string
  iso_code: string | null
  size_type: string | null
  status: string | null
}

export interface ContainerEvent {
  id: string
  container_id: string
  shipment_id: string
  description: string | null
  event_type: string | null
  event_code: string | null
  status: string | null
  date: string | null
  is_actual: number
  is_additional_event: number
  route_type: string | null
  transport_type: string | null
  location_name: string | null
  location_country: string | null
  location_locode: string | null
  location_lat: number | null
  location_lng: number | null
  facility_name: string | null
  vessel_name: string | null
  vessel_imo: number | null
  voyage: string | null
}

export interface ShipmentSearchParams {
  q?: string
  bl_number?: string
  container_number?: string
  shipment_number?: string
  vessel_name?: string
  customer_name?: string
  date_from?: string
  date_to?: string
  status?: string
  page?: number
  limit?: number
  tracking_id?: string
}

/* ── Alert Types ───────────────────────────────── */

export interface Alert {
  id: string
  shipment_id: string | null
  shipment_number: string | null
  alert_type: string
  alert_info: string | null
  severity: string
  status: string
  detection_date: string
  action_taken: string | null
  resolved_at: string | null
  resolved_by: string | null
  created_at: string
  updated_at: string
}

/* ── Calendar Types ────────────────────────────── */

export interface CalendarEvent {
  id: string
  shipment_id: string | null
  event_type: string
  title: string
  description: string | null
  event_date: string
  all_day: number
  color: string | null
  created_at: string
  updated_at: string
}

/* ── Pricing Types ─────────────────────────────── */

export interface Job {
  id: string
  customer_id: string | null
  shipper: string | null
  consignee: string | null
  commodity: string | null
  package_contains: string | null
  package_type: string | null
  date_needed: string | null
  weight: number | null
  cbm: number | null
  incoterm: string | null
  pickup: string | null
  delivery: string | null
  additional_notes: string | null
  status: string
  created_at: string
  updated_at: string
}

export interface Pricing {
  id: string
  job_id: string
  agent_rate: number | null
  clearance_charges: number
  delivery_order: number
  vat: number
  markup_percent: number
  total_cost: number
  selling_price: number
  profit_value: number
  profit_margin_percent: number
  currency: string
  notes: string | null
  created_at: string
  updated_at: string
}

export interface PricingInput {
  agent_rate: number
  clearance_charges?: number
  delivery_order?: number
  vat?: number
  markup_percent?: number
  currency?: string
  notes?: string
}

/* ── Customer Types ────────────────────────────── */

export interface Customer {
  id: string
  name: string
  email: string | null
  company: string | null
  phone: string | null
  address: string | null
  contact_person: string | null
  notes: string | null
  created_at: string
  updated_at: string
}

/* ── Assignment Types ──────────────────────────── */

export interface Assignment {
  id: string
  shipment_id: string
  customer_id?: string
  tracking_id: string
  customer_name: string
  customer_email: string
  assigned_by?: string
  notes?: string
  created_at: string
  updated_at: string
}

/* ── API Response Wrappers ─────────────────────── */

export interface ApiResponse<T> {
  success: boolean
  data: T
  error?: string
}

export interface PaginatedResponse<T> {
  success: boolean
  data: T[]
  error?: string
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}
