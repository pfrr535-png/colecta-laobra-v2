"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import Combobox from "@/components/Combobox";
import QuantityStepper from "@/components/QuantityStepper";
import { HYGIENE_PRODUCTS, OTRO, categoryForProduct } from "@/lib/constants";
import { ItemRow } from "@/lib/types";

const HYGIENE_OPTIONS = HYGIENE_PRODUCTS.map((p) => p.name);

export default function HygieneSection({
  volunteerId,
  supermarketId,
  shiftId,
  onAdded,
}: {
  volunteerId: string;
  supermarketId: string;
  shiftId: string;
  onAdded: (item: ItemRow) => void;
}) {
  const [product, setProduct] = useState("");
  const [customName, setCustomName] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const finalName = product === OTRO ? customName.trim() : product;

  function resetForm() {
    setProduct("");
    setCustomName("");
    setQuantity(1);
  }

  async function handleAdd() {
    setError("");
    if (!finalName) {
      setError("Selecciona o escribe un artículo.");
      return;
    }
    setSaving(true);
    const category = categoryForProduct(finalName, HYGIENE_PRODUCTS);
    const { data, error } = await supabase
      .from("items")
      .insert({
        volunteer_id: volunteerId,
        supermarket_id: supermarketId,
        shift_id: shiftId,
        product_name: finalName,
        category,
        quantity,
        item_type: "hygiene",
        weight_per_unit: null,
        weight_unit: null,
        total_weight_kg: null,
      })
      .select()
      .single();
    setSaving(false);
    if (error || !data) {
      setError("No se pudo guardar el artículo.");
      return;
    }
    onAdded(data as ItemRow);
    resetForm();
  }

  return (
    <section className="rounded-xl bg-white p-4 shadow-sm">
      <h2 className="mb-3 text-lg font-bold text-navy">🧴 Artículos de Aseo</h2>
      <div className="flex flex-col gap-3">
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Artículo
          </label>
          <Combobox
            options={HYGIENE_OPTIONS}
            value={product}
            onChange={setProduct}
            placeholder="Buscar artículo..."
          />
        </div>
        {product === OTRO && (
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Especifica el artículo
            </label>
            <input
              type="text"
              value={customName}
              onChange={(e) => setCustomName(e.target.value)}
              placeholder="Nombre del artículo"
              className="h-12 w-full rounded-lg border border-gray-300 px-3 text-base focus:border-orange focus:outline-none focus:ring-2 focus:ring-orange/30"
            />
          </div>
        )}
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Cantidad
          </label>
          <QuantityStepper value={quantity} onChange={setQuantity} />
        </div>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button
          type="button"
          onClick={handleAdd}
          disabled={saving}
          className="h-12 rounded-lg bg-orange text-base font-bold text-white shadow active:bg-orange-dark disabled:opacity-60"
        >
          {saving ? "Agregando..." : "+ Agregar artículo"}
        </button>
      </div>
    </section>
  );
}
