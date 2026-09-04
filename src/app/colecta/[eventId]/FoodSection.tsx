"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import Combobox from "@/components/Combobox";
import QuantityStepper from "@/components/QuantityStepper";
import { FOOD_PRODUCTS, OTRO, WEIGHT_UNITS, categoryForProduct, toKg } from "@/lib/constants";
import { ItemRow, WeightUnit } from "@/lib/types";

const FOOD_OPTIONS = FOOD_PRODUCTS.map((p) => p.name);

export default function FoodSection({
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
  const [weightPerUnit, setWeightPerUnit] = useState("");
  const [weightUnit, setWeightUnit] = useState<WeightUnit>("kg");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const finalName = product === OTRO ? customName.trim() : product;
  const weightValue = parseFloat(weightPerUnit.replace(",", "."));
  const validWeight = !Number.isNaN(weightValue) && weightValue > 0;
  const totalKg = validWeight ? quantity * toKg(weightValue, weightUnit) : 0;

  function resetForm() {
    setProduct("");
    setCustomName("");
    setQuantity(1);
    setWeightPerUnit("");
    setWeightUnit("kg");
  }

  async function handleAdd() {
    setError("");
    if (!finalName) {
      setError("Selecciona o escribe un producto.");
      return;
    }
    if (!validWeight) {
      setError("Ingresa un peso por unidad válido.");
      return;
    }
    setSaving(true);
    const category = categoryForProduct(finalName, FOOD_PRODUCTS);
    const { data, error } = await supabase
      .from("items")
      .insert({
        volunteer_id: volunteerId,
        supermarket_id: supermarketId,
        shift_id: shiftId,
        product_name: finalName,
        category,
        quantity,
        item_type: "food",
        weight_per_unit: weightValue,
        weight_unit: weightUnit,
        total_weight_kg: totalKg,
      })
      .select()
      .single();
    setSaving(false);
    if (error || !data) {
      setError("No se pudo guardar el alimento.");
      return;
    }
    onAdded(data as ItemRow);
    resetForm();
  }

  return (
    <section className="rounded-xl bg-white p-4 shadow-sm">
      <h2 className="mb-3 text-lg font-bold text-navy">🥫 Alimentos</h2>
      <div className="flex flex-col gap-3">
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Producto
          </label>
          <Combobox
            options={FOOD_OPTIONS}
            value={product}
            onChange={setProduct}
            placeholder="Buscar alimento..."
          />
        </div>
        {product === OTRO && (
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Especifica el producto
            </label>
            <input
              type="text"
              value={customName}
              onChange={(e) => setCustomName(e.target.value)}
              placeholder="Nombre del producto"
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
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Peso por unidad
          </label>
          <div className="flex gap-2">
            <input
              type="number"
              inputMode="decimal"
              value={weightPerUnit}
              onChange={(e) => setWeightPerUnit(e.target.value)}
              placeholder="Ej: 0.5"
              className="h-12 w-full rounded-lg border border-gray-300 px-3 text-base focus:border-orange focus:outline-none focus:ring-2 focus:ring-orange/30"
            />
            <div className="flex overflow-hidden rounded-lg border border-gray-300">
              {WEIGHT_UNITS.map((u) => (
                <button
                  key={u}
                  type="button"
                  onClick={() => setWeightUnit(u)}
                  className={`h-12 w-14 text-sm font-semibold ${
                    weightUnit === u
                      ? "bg-navy text-white"
                      : "bg-white text-gray-600"
                  }`}
                >
                  {u}
                </button>
              ))}
            </div>
          </div>
        </div>
        <p className="text-sm font-semibold text-navy">
          Total: {totalKg.toFixed(2)} kg
        </p>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button
          type="button"
          onClick={handleAdd}
          disabled={saving}
          className="h-12 rounded-lg bg-orange text-base font-bold text-white shadow active:bg-orange-dark disabled:opacity-60"
        >
          {saving ? "Agregando..." : "+ Agregar alimento"}
        </button>
      </div>
    </section>
  );
}
