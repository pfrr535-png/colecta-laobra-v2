import { WeightUnit } from "./types";

export const OTRO = "Otro";

export interface ProductOption {
  name: string;
  category: string;
}

export const FOOD_PRODUCTS: ProductOption[] = [
  { name: "Fideos", category: "Pastas" },
  { name: "Arroz", category: "Cereales y Legumbres" },
  { name: "Atún", category: "Conservas" },
  { name: "Crema", category: "Conservas" },
  { name: "Aceite", category: "Aceites" },
  { name: "Salsa de tomate", category: "Conservas" },
  { name: "Lentejas", category: "Legumbres" },
  { name: "Porotos", category: "Legumbres" },
  { name: "Garbanzos", category: "Legumbres" },
  { name: "Condimento", category: "Condimentos" },
  { name: "Jurel", category: "Conservas" },
  { name: "Té", category: "Bebidas" },
  { name: "Azúcar", category: "Endulzantes" },
  { name: "Café", category: "Bebidas" },
  { name: "Sal", category: "Condimentos" },
  { name: OTRO, category: "Otros" },
];

export const HYGIENE_PRODUCTS: ProductOption[] = [
  { name: "Confort", category: "Papel Higiénico" },
  { name: "Cloro", category: "Limpieza" },
  { name: "Lava loza", category: "Limpieza" },
  { name: "Servilletas", category: "Papel Higiénico" },
  { name: "Toalla Nova", category: "Papel Higiénico" },
  { name: "Guantes de baño", category: "Higiene Personal" },
  { name: "Esponja", category: "Limpieza" },
  { name: OTRO, category: "Otros" },
];

export function categoryForProduct(
  productName: string,
  options: ProductOption[]
): string {
  const match = options.find(
    (o) => o.name.toLowerCase() === productName.toLowerCase()
  );
  return match ? match.category : "Otros";
}

export interface ShiftSlot {
  start_time: string;
  end_time: string;
  label: string;
}

export const SHIFT_SLOTS: ShiftSlot[] = Array.from({ length: 9 }, (_, i) => {
  const startHour = 9 + i;
  const endHour = startHour + 1;
  const start_time = `${String(startHour).padStart(2, "0")}:00`;
  const end_time = `${String(endHour).padStart(2, "0")}:00`;
  return { start_time, end_time, label: `${start_time} - ${end_time}` };
});

export const WEIGHT_UNITS: WeightUnit[] = ["kg", "lt", "g"];

export function toKg(weight: number, unit: WeightUnit): number {
  if (unit === "g") return weight / 1000;
  // kg and lt are treated 1:1, standard approximation used in food drives
  return weight;
}
