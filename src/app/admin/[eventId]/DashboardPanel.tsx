"use client";

import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { ItemRow, SupermarketRow } from "@/lib/types";
import { effectiveWeightKg } from "@/lib/constants";
import { exportEventToExcel } from "@/lib/xlsxExport";

export default function DashboardPanel({
  eventId,
  eventName,
}: {
  eventId: string;
  eventName: string;
}) {
  const [supermarkets, setSupermarkets] = useState<SupermarketRow[]>([]);
  const [items, setItems] = useState<ItemRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    const { data: sms } = await supabase
      .from("supermarkets")
      .select("*")
      .eq("event_id", eventId)
      .order("created_at", { ascending: true });
    const supermarketList = (sms ?? []) as SupermarketRow[];
    setSupermarkets(supermarketList);

    const supermarketIds = supermarketList.map((s) => s.id);
    if (supermarketIds.length > 0) {
      const { data: itemRows } = await supabase
        .from("items")
        .select("*")
        .in("supermarket_id", supermarketIds);
      setItems((itemRows ?? []) as ItemRow[]);
    } else {
      setItems([]);
    }
    setLoading(false);
  }, [eventId]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadData();
  }, [loadData]);

  useEffect(() => {
    const channel = supabase
      .channel(`dashboard-items-${eventId}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "items" },
        () => loadData()
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [eventId, loadData]);

  const totalItems = items.reduce((sum, i) => sum + i.quantity, 0);
  const totalKgFood = items
    .filter((i) => i.item_type === "food")
    .reduce((sum, i) => sum + effectiveWeightKg(i), 0);
  const totalHygieneUnits = items
    .filter((i) => i.item_type === "hygiene")
    .reduce((sum, i) => sum + i.quantity, 0);

  const bySupermarket = supermarkets.map((sm) => {
    const smItems = items.filter((i) => i.supermarket_id === sm.id);
    return {
      supermarket: sm,
      items: smItems.reduce((sum, i) => sum + i.quantity, 0),
      kgFood: smItems
        .filter((i) => i.item_type === "food")
        .reduce((sum, i) => sum + effectiveWeightKg(i), 0),
      hygieneUnits: smItems
        .filter((i) => i.item_type === "hygiene")
        .reduce((sum, i) => sum + i.quantity, 0),
    };
  });

  interface ProductRow {
    product_name: string;
    category: string;
    item_type: string;
    quantity: number;
    totalKg: number;
  }
  const productMap = new Map<string, ProductRow>();
  for (const item of items) {
    const key = `${item.item_type}__${item.product_name}`;
    const existing = productMap.get(key);
    if (existing) {
      existing.quantity += item.quantity;
      existing.totalKg += effectiveWeightKg(item);
    } else {
      productMap.set(key, {
        product_name: item.product_name,
        category: item.category,
        item_type: item.item_type,
        quantity: item.quantity,
        totalKg: effectiveWeightKg(item),
      });
    }
  }
  const productRows = Array.from(productMap.values()).sort((a, b) =>
    a.product_name.localeCompare(b.product_name, "es")
  );

  async function handleExport() {
    setExporting(true);
    try {
      await exportEventToExcel(eventId, eventName);
    } catch {
      alert("No se pudo generar el archivo Excel.");
    }
    setExporting(false);
  }

  if (loading) {
    return <p className="text-sm text-gray-500">Cargando datos...</p>;
  }

  return (
    <div className="flex flex-col gap-6">
      <section className="grid grid-cols-3 gap-3">
        <StatCard label="Total ítems" value={totalItems.toString()} />
        <StatCard label="Total kg alimentos" value={totalKgFood.toFixed(1)} />
        <StatCard label="Unid. aseo" value={totalHygieneUnits.toString()} />
      </section>

      <button
        type="button"
        onClick={handleExport}
        disabled={exporting}
        className="h-12 rounded-lg bg-orange text-base font-bold text-white shadow active:bg-orange-dark disabled:opacity-60"
      >
        {exporting ? "Generando..." : "⬇ Exportar Excel"}
      </button>

      <section className="rounded-xl bg-white p-4 shadow-sm">
        <h2 className="mb-3 text-lg font-bold text-navy">Por supermercado</h2>
        {bySupermarket.length === 0 ? (
          <p className="text-sm text-gray-500">Sin supermercados registrados.</p>
        ) : (
          <div className="flex flex-col gap-2">
            {bySupermarket.map((row) => (
              <div
                key={row.supermarket.id}
                className="flex items-center justify-between border-b border-gray-100 py-2 last:border-0"
              >
                <span className="font-medium text-navy">
                  {row.supermarket.name}
                </span>
                <span className="text-sm text-gray-600">
                  {row.items} ítems · {row.kgFood.toFixed(1)} kg · {row.hygieneUnits}{" "}
                  aseo
                </span>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="rounded-xl bg-white p-4 shadow-sm overflow-x-auto">
        <h2 className="mb-3 text-lg font-bold text-navy">Detalle por producto</h2>
        {productRows.length === 0 ? (
          <p className="text-sm text-gray-500">Aún no se han registrado ítems.</p>
        ) : (
          <table className="w-full min-w-[480px] text-left text-sm">
            <thead>
              <tr className="border-b border-gray-200 text-gray-500">
                <th className="py-2 pr-2">Producto</th>
                <th className="py-2 pr-2">Categoría</th>
                <th className="py-2 pr-2">Tipo</th>
                <th className="py-2 pr-2">Unidades</th>
                <th className="py-2">Total kg</th>
              </tr>
            </thead>
            <tbody>
              {productRows.map((row) => (
                <tr
                  key={`${row.item_type}-${row.product_name}`}
                  className="border-b border-gray-100 last:border-0"
                >
                  <td className="py-2 pr-2 font-medium text-navy">
                    {row.product_name}
                  </td>
                  <td className="py-2 pr-2 text-gray-600">{row.category}</td>
                  <td className="py-2 pr-2 text-gray-600">
                    {row.item_type === "food" ? "Alimento" : "Aseo"}
                  </td>
                  <td className="py-2 pr-2 text-gray-600">{row.quantity}</td>
                  <td className="py-2 text-gray-600">
                    {row.item_type === "food" ? row.totalKg.toFixed(2) : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-white p-3 text-center shadow-sm">
      <p className="text-xl font-bold text-orange">{value}</p>
      <p className="text-xs text-gray-500">{label}</p>
    </div>
  );
}
