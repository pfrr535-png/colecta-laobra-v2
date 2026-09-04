"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { EventRow } from "@/lib/types";

export default function AdminHome({ adminKey }: { adminKey: string }) {
  const [events, setEvents] = useState<EventRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");

  async function loadEvents() {
    setLoading(true);
    const { data, error } = await supabase
      .from("events")
      .select("*")
      .order("created_at", { ascending: false });
    if (!error && data) setEvents(data as EventRow[]);
    setLoading(false);
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadEvents();
  }, []);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!name.trim() || !eventDate) {
      setError("Completa el nombre y la fecha de la colecta.");
      return;
    }
    setCreating(true);
    const { error } = await supabase
      .from("events")
      .insert({ name: name.trim(), event_date: eventDate });
    setCreating(false);
    if (error) {
      setError("No se pudo crear la colecta. Intenta nuevamente.");
      return;
    }
    setName("");
    setEventDate("");
    loadEvents();
  }

  return (
    <div className="flex flex-col gap-6">
      <section className="rounded-xl bg-white p-4 shadow-sm">
        <h2 className="mb-3 text-lg font-bold text-navy">Nueva colecta</h2>
        <form onSubmit={handleCreate} className="flex flex-col gap-3">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Nombre de la colecta
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ej: Colecta Otoño 2026"
              className="h-12 w-full rounded-lg border border-gray-300 px-3 text-base focus:border-orange focus:outline-none focus:ring-2 focus:ring-orange/30"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Fecha
            </label>
            <input
              type="date"
              value={eventDate}
              onChange={(e) => setEventDate(e.target.value)}
              className="h-12 w-full rounded-lg border border-gray-300 px-3 text-base focus:border-orange focus:outline-none focus:ring-2 focus:ring-orange/30"
            />
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <button
            type="submit"
            disabled={creating}
            className="h-12 rounded-lg bg-orange text-base font-bold text-white shadow active:bg-orange-dark disabled:opacity-60"
          >
            {creating ? "Creando..." : "+ Crear colecta"}
          </button>
        </form>
      </section>

      <section>
        <h2 className="mb-3 text-lg font-bold text-navy">Colectas</h2>
        {loading ? (
          <p className="text-sm text-gray-500">Cargando...</p>
        ) : events.length === 0 ? (
          <p className="text-sm text-gray-500">Aún no hay colectas creadas.</p>
        ) : (
          <div className="flex flex-col gap-3">
            {events.map((ev) => (
              <Link
                key={ev.id}
                href={`/admin/${ev.id}?key=${encodeURIComponent(adminKey)}`}
                className="block rounded-xl bg-white p-4 shadow-sm active:bg-gray-50"
              >
                <p className="text-base font-bold text-navy">{ev.name}</p>
                <p className="text-sm text-gray-500">
                  {new Date(ev.event_date + "T00:00:00").toLocaleDateString(
                    "es-CL",
                    { day: "2-digit", month: "long", year: "numeric" }
                  )}
                </p>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
