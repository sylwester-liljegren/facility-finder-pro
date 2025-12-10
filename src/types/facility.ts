export interface Kommun {
  id: number;
  kommun_namn: string;
  kommun_kod: string;
}

export interface FacilityType {
  id: number;
  code: string;
  label: string;
  description: string | null;
}

export interface Facility {
  id: number;
  external_id: string | null;
  name: string;
  facility_type_id: number | null;
  kommun_id: number | null;
  address: string | null;
  postal_code: string | null;
  city: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
  facility_type?: FacilityType;
  kommun?: Kommun;
  facility_geometry?: FacilityGeometry | FacilityGeometry[];
}

export interface FacilityGeometry {
  facility_id: number;
  geom: unknown;
  geom_type: string | null;
  latitude: number | null;
  longitude: number | null;
  updated_at: string;
}

export interface ActivityArea {
  id: number;
  facility_id: number;
  area_type: string | null;
  name: string | null;
  description: string | null;
  capacity: number | null;
  geom: unknown;
  created_at: string;
  updated_at: string;
}

export interface FacilityAttribute {
  id: number;
  facility_id: number;
  attribute: string;
  value: string | null;
}

export interface FacilityFormData {
  name: string;
  facility_type_id: number | null;
  kommun_id: number | null;
  address: string;
  postal_code: string;
  city: string;
  latitude?: number;
  longitude?: number;
}