"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { SupermarketRow } from "@/lib/types";
import ShiftGrid from "./ShiftGrid";

const MAX_SUPERMARKETS = 5;

export default function SupermarketsPanel({ eventId }: { eventId: string }) {
  const [supermarkets, setSupermarkets] = useState<SupermarketRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState("");
  const [activeCounts, setActiveCounts] = useState<Record<string, number>>({});

  async function loadSupermarkets() {
    setLoading(true);
    const { data, error } = await supabase
      .from("supermarkets")
      .select("*")
      .eq("event_id", eventId)
      .order("created_at", { ascending: true });
    if (!error && data) setSupermarkets(data as SupermarketRow[]);
    setLoading(false);
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadSupermarkets();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [eventId]);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!name.trim()) return;
    if (supermarkets.length >= MAX_SUPERMARKETS) {
      setError(`Máximo ${MAX_SUPERMARKETS} supermercados por colecta.`);
      return;
    }
    setAdding(true);
    const { error } = await supabase
      .from("supermarkets")
      .insert({ event_id: eventId, name: name.trim() });
    setAdding(false);
    if (error) {
      setError("No se pudo agregar el supermercado.");
      return;
    }
    setName("");
    loadSupermarkets();
  }

  async function handleDelete(id: string) {
    if (!confirm("¿Eliminar este supermercado y sus turnos?")) return;
    await supabase.from("shifts").delete().eq("supermarket_id", id);
    await supabase.from("supermarkets").delete().eq("id", id);
    loadSupermarkets();
  }

  return (
    <div className="flex flex-col gap-6">
      <section className="rounded-xl bg-white p-4 shadow-sm">
        <h2 className="mb-3 text-lg font-bold text-navy">
          Supermercados ({supermarkets.length}/{MAX_SUPERMARKETS})
        </h2>
        <form onSubmit={handleAdd} className="flex gap-2">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Nombre del supermercado"
            disabled={supermarkets.length >= MAX_SUPERMARKETS}
            className="h-12 flex-1 rounded-lg border border-gray-300 px-3 text-base focus:border-orange focus:outline-none focus:ring-2 focus:ring-orange/30 disabled:bg-gray-100"
          />
          <button
            type="submit"
            disabled={adding || supermarkets.length >= MAX_SUPERMARKETS}
            className="h-12 rounded-lg bg-orange px-4 text-base font-bold text-white shadow active:bg-orange-dark disabled:opacity-60"
          >
            Agregar
          </button>
        </form>
        {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
      </section>

      {loading ? (
        <p className="text-sm text-gray-500">Cargando supermercados...</p>
      ) : supermarkets.length === 0 ? (
        <p className="text-sm text-gray-500">
          Agrega al menos un supermercado para esta colecta.
        </p>
      ) : (
        supermarkets.map((sm) => (
          <section key={sm.id} className="rounded-xl bg-white p-4 shadow-sm">
            <div className="mb-3 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-navy">{sm.name}</h3>
                <p className="text-xs text-gray-500">
                  {activeCounts[sm.id] ?? 0} turno(s) activo(s)
                </p>
              </div>
              <button
                type="button"
                onClick={() => handleDelete(sm.id)}
                className="text-sm font-medium text-red-600"
              >
                Eliminar
              </button>
            </div>
            <ShiftGrid
              supermarketId={sm.id}
              onCountChange={(count) =>
                setActiveCounts((prev) => ({ ...prev, [sm.id]: count }))
              }
            />
          </section>
        ))
      )}
    </div>
  );
}
