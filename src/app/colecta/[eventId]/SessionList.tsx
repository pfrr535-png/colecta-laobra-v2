"use client";

import { ItemRow } from "@/lib/types";

export default function SessionList({
  items,
  onDelete,
}: {
  items: ItemRow[];
  onDelete: (id: string) => void;
}) {
  if (items.length === 0) return null;

  return (
    <section className="rounded-xl bg-white p-4 shadow-sm">
      <h2 className="mb-3 text-lg font-bold text-navy">
        Tus registros de esta sesión ({items.length})
      </h2>
      <ul className="flex flex-col divide-y divide-gray-100">
        {items.map((item) => (
          <li key={item.id} className="flex items-center justify-between py-2">
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-navy">
                {item.product_name}
                <span className="ml-1 text-xs text-gray-400">
                  {item.item_type === "food" ? "🥫" : "🧴"}
                </span>
              </p>
              <p className="text-xs text-gray-500">
                {item.quantity} unid.
                {item.item_type === "food" &&
                  ` · ${item.weight_per_unit} ${item.weight_unit} c/u · ${item.total_weight_kg?.toFixed(
                    2
                  )} kg`}
              </p>
            </div>
            <button
              type="button"
              onClick={() => onDelete(item.id)}
              className="ml-3 shrink-0 rounded-lg px-3 py-2 text-sm font-semibold text-red-600 active:bg-red-50"
            >
              Eliminar
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}
