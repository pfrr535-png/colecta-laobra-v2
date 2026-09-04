import * as XLSX from "xlsx";
import { supabase } from "./supabaseClient";
import { ItemRow, SupermarketRow } from "./types";

function sanitizeSheetName(name: string): string {
  // Excel sheet names: max 31 chars, no : \ / ? * [ ]
  return name.replace(/[:\\/?*[\]]/g, " ").slice(0, 31) || "Hoja";
}

function uniqueSheetName(base: string, used: Map<string, number>): string {
  const clean = sanitizeSheetName(base);
  const count = used.get(clean) ?? 0;
  used.set(clean, count + 1);
  if (count === 0) return clean;
  const suffix = ` (${count + 1})`;
  return sanitizeSheetName(clean.slice(0, 31 - suffix.length) + suffix);
}

interface Aggregated {
  product_name: string;
  category: string;
  quantity: number;
  weight_per_unit: number | null;
  weight_unit: string | null;
  total_weight_kg: number;
}

function aggregateItems(items: ItemRow[]): Aggregated[] {
  const map = new Map<string, Aggregated>();
  for (const item of items) {
    const key = `${item.product_name}__${item.weight_per_unit ?? ""}__${
      item.weight_unit ?? ""
    }`;
    const existing = map.get(key);
    if (existing) {
      existing.quantity += item.quantity;
      existing.total_weight_kg += item.total_weight_kg ?? 0;
    } else {
      map.set(key, {
        product_name: item.product_name,
        category: item.category,
        quantity: item.quantity,
        weight_per_unit: item.weight_per_unit,
        weight_unit: item.weight_unit,
        total_weight_kg: item.total_weight_kg ?? 0,
      });
    }
  }
  return Array.from(map.values()).sort((a, b) =>
    a.product_name.localeCompare(b.product_name, "es")
  );
}

function categoryTotals(items: Aggregated[]) {
  const map = new Map<string, { quantity: number; totalKg: number }>();
  for (const item of items) {
    const existing = map.get(item.category) ?? { quantity: 0, totalKg: 0 };
    existing.quantity += item.quantity;
    existing.totalKg += item.total_weight_kg;
    map.set(item.category, existing);
  }
  return Array.from(map.entries())
    .map(([category, v]) => ({ category, ...v }))
    .sort((a, b) => a.category.localeCompare(b.category, "es"));
}

export async function exportEventToExcel(eventId: string, eventName: string) {
  const { data: supermarkets, error: smError } = await supabase
    .from("supermarkets")
    .select("*")
    .eq("event_id", eventId)
    .order("created_at", { ascending: true });
  if (smError) throw smError;

  const supermarketList = (supermarkets ?? []) as SupermarketRow[];
  const supermarketIds = supermarketList.map((s) => s.id);

  let allItems: ItemRow[] = [];
  if (supermarketIds.length > 0) {
    const { data: items, error: itemsError } = await supabase
      .from("items")
      .select("*")
      .in("supermarket_id", supermarketIds);
    if (itemsError) throw itemsError;
    allItems = (items ?? []) as ItemRow[];
  }

  const wb = XLSX.utils.book_new();
  const usedNames = new Map<string, number>();

  for (const sm of supermarketList) {
    const smItems = allItems.filter((i) => i.supermarket_id === sm.id);
    const foodItems = aggregateItems(smItems.filter((i) => i.item_type === "food"));
    const hygieneItems = aggregateItems(
      smItems.filter((i) => i.item_type === "hygiene")
    );

    const rows: (string | number)[][] = [];
    rows.push(["Alimentos"]);
    rows.push([
      "Producto",
      "Categoría",
      "Unidades",
      "Peso por unidad",
      "Unidad",
      "Total kg",
    ]);
    for (const f of foodItems) {
      rows.push([
        f.product_name,
        f.category,
        f.quantity,
        f.weight_per_unit ?? "",
        f.weight_unit ?? "",
        Number(f.total_weight_kg.toFixed(2)),
      ]);
    }
    rows.push([]);
    rows.push(["Artículos de Aseo"]);
    rows.push(["Producto", "Categoría", "Unidades"]);
    for (const h of hygieneItems) {
      rows.push([h.product_name, h.category, h.quantity]);
    }

    const ws = XLSX.utils.aoa_to_sheet(rows);
    ws["!cols"] = [
      { wch: 22 },
      { wch: 20 },
      { wch: 10 },
      { wch: 16 },
      { wch: 8 },
      { wch: 10 },
    ];
    const sheetName = uniqueSheetName(sm.name, usedNames);
    XLSX.utils.book_append_sheet(wb, ws, sheetName);
  }

  // Summary sheet across all supermarkets
  const allFood = aggregateItems(allItems.filter((i) => i.item_type === "food"));
  const allHygiene = aggregateItems(
    allItems.filter((i) => i.item_type === "hygiene")
  );
  const foodCategoryTotals = categoryTotals(allFood);
  const hygieneCategoryTotals = categoryTotals(allHygiene);
  const totalKgFood = allFood.reduce((sum, f) => sum + f.total_weight_kg, 0);
  const totalHygieneUnits = allHygiene.reduce((sum, h) => sum + h.quantity, 0);

  const summaryRows: (string | number)[][] = [];
  summaryRows.push([`Resumen General - ${eventName}`]);
  summaryRows.push([]);
  summaryRows.push(["Alimentos por producto"]);
  summaryRows.push(["Producto", "Categoría", "Unidades totales", "Total kg"]);
  for (const f of allFood) {
    summaryRows.push([
      f.product_name,
      f.category,
      f.quantity,
      Number(f.total_weight_kg.toFixed(2)),
    ]);
  }
  summaryRows.push([]);
  summaryRows.push(["Totales por categoría (Alimentos)"]);
  summaryRows.push(["Categoría", "Unidades", "Total kg"]);
  for (const c of foodCategoryTotals) {
    summaryRows.push([c.category, c.quantity, Number(c.totalKg.toFixed(2))]);
  }
  summaryRows.push([]);
  summaryRows.push(["Artículos de Aseo por producto"]);
  summaryRows.push(["Producto", "Categoría", "Unidades totales"]);
  for (const h of allHygiene) {
    summaryRows.push([h.product_name, h.category, h.quantity]);
  }
  summaryRows.push([]);
  summaryRows.push(["Totales por categoría (Aseo)"]);
  summaryRows.push(["Categoría", "Unidades"]);
  for (const c of hygieneCategoryTotals) {
    summaryRows.push([c.category, c.quantity]);
  }
  summaryRows.push([]);
  summaryRows.push(["Totales Generales"]);
  summaryRows.push(["Total kg alimentos", Number(totalKgFood.toFixed(2))]);
  summaryRows.push(["Total unidades aseo", totalHygieneUnits]);

  const summaryWs = XLSX.utils.aoa_to_sheet(summaryRows);
  summaryWs["!cols"] = [{ wch: 26 }, { wch: 20 }, { wch: 16 }, { wch: 10 }];
  // Summary sheet first
  XLSX.utils.book_append_sheet(wb, summaryWs, "Resumen");
  wb.SheetNames.unshift(wb.SheetNames.pop()!);

  const fileName = `${sanitizeSheetName(eventName)}_colecta.xlsx`;
  XLSX.writeFile(wb, fileName);
}
