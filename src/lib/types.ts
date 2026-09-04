export type ItemType = "food" | "hygiene";
export type WeightUnit = "kg" | "lt" | "g";

export interface EventRow {
  id: string;
  name: string;
  event_date: string;
  created_at: string;
}

export interface SupermarketRow {
  id: string;
  event_id: string;
  name: string;
  created_at: string;
}

export interface ShiftRow {
  id: string;
  supermarket_id: string;
  start_time: string;
  end_time: string;
  created_at: string;
}

export interface VolunteerRow {
  id: string;
  supermarket_id: string;
  shift_id: string;
  name: string;
  created_at: string;
}

export interface ItemRow {
  id: string;
  volunteer_id: string;
  supermarket_id: string;
  shift_id: string;
  product_name: string;
  category: string;
  quantity: number;
  item_type: ItemType;
  weight_per_unit: number | null;
  weight_unit: WeightUnit | null;
  total_weight_kg: number | null;
  created_at: string;
}
