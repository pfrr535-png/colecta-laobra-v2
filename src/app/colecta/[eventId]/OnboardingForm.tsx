"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { ShiftRow, SupermarketRow } from "@/lib/types";

export interface VolunteerSession {
  volunteerId: string;
  name: string;
  supermarketId: string;
  supermarketName: string;
  shiftId: string;
  shiftLabel: string;
}

export default function OnboardingForm({
  eventId,
  onJoin,
}: {
  eventId: string;
  onJoin: (session: VolunteerSession) => void;
}) {
  const [supermarkets, setSupermarkets] = useState<SupermarketRow[]>([]);
  const [shifts, setShifts] = useState<ShiftRow[]>([]);
  const [name, setName] = useState("");
  const [supermarketId, setSupermarketId] = useState("");
  const [shiftId, setShiftId] = useState("");
  const [loadingShifts, setLoadingShifts] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadSupermarkets() {
      const { data } = await supabase
        .from("supermarkets")
        .select("*")
        .eq("event_id", eventId)
        .order("created_at", { ascending: true });
      setSupermarkets((data ?? []) as SupermarketRow[]);
    }
    loadSupermarkets();
  }, [eventId]);

  useEffect(() => {
    if (!supermarketId) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setShifts([]);
      setShiftId("");
      return;
    }
    async function loadShifts() {
      setLoadingShifts(true);
      const { data } = await supabase
        .from("shifts")
        .select("*")
        .eq("supermarket_id", supermarketId)
        .order("start_time", { ascending: true });
      setShifts((data ?? []) as ShiftRow[]);
      setShiftId("");
      setLoadingShifts(false);
    }
    loadShifts();
  }, [supermarketId]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!name.trim() || !supermarketId || !shiftId) {
      setError("Completa tu nombre, supermercado y turno.");
      return;
    }
    setSubmitting(true);
    const { data, error } = await supabase
      .from("volunteers")
      .insert({
        event_id: eventId,
        supermarket_id: supermarketId,
        shift_id: shiftId,
        name: name.trim(),
      })
      .select()
      .single();
    setSubmitting(false);
    if (error || !data) {
      setError("No se pudo registrar tu turno. Intenta nuevamente.");
      return;
    }
    const supermarket = supermarkets.find((s) => s.id === supermarketId);
    const shift = shifts.find((s) => s.id === shiftId);
    onJoin({
      volunteerId: data.id,
      name: name.trim(),
      supermarketId,
      supermarketName: supermarket?.name ?? "",
      shiftId,
      shiftLabel: shift ? `${shift.start_time} - ${shift.end_time}` : "",
    });
  }

  return (
    <div className="rounded-xl bg-white p-4 shadow-sm">
      <h1 className="mb-1 text-lg font-bold text-navy">¡Bienvenido/a!</h1>
      <p className="mb-4 text-sm text-gray-600">
        Ingresa tus datos para comenzar a registrar donaciones.
      </p>
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Tu nombre
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Nombre y apellido"
            className="h-12 w-full rounded-lg border border-gray-300 px-3 text-base focus:border-orange focus:outline-none focus:ring-2 focus:ring-orange/30"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Supermercado
          </label>
          <select
            value={supermarketId}
            onChange={(e) => setSupermarketId(e.target.value)}
            className="h-12 w-full rounded-lg border border-gray-300 bg-white px-3 text-base focus:border-orange focus:outline-none focus:ring-2 focus:ring-orange/30"
          >
            <option value="">Selecciona un supermercado</option>
            {supermarkets.map((sm) => (
              <option key={sm.id} value={sm.id}>
                {sm.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Turno
          </label>
          <select
            value={shiftId}
            onChange={(e) => setShiftId(e.target.value)}
            disabled={!supermarketId || loadingShifts}
            className="h-12 w-full rounded-lg border border-gray-300 bg-white px-3 text-base focus:border-orange focus:outline-none focus:ring-2 focus:ring-orange/30 disabled:bg-gray-100"
          >
            <option value="">
              {loadingShifts
                ? "Cargando turnos..."
                : supermarketId
                ? "Selecciona un turno"
                : "Elige primero un supermercado"}
            </option>
            {shifts.map((s) => (
              <option key={s.id} value={s.id}>
                {s.start_time} - {s.end_time}
              </option>
            ))}
          </select>
          {supermarketId && !loadingShifts && shifts.length === 0 && (
            <p className="mt-1 text-sm text-gray-500">
              Este supermercado aún no tiene turnos activos.
            </p>
          )}
        </div>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button
          type="submit"
          disabled={submitting}
          className="mt-2 h-12 rounded-lg bg-orange text-base font-bold text-white shadow active:bg-orange-dark disabled:opacity-60"
        >
          {submitting ? "Ingresando..." : "Comenzar a registrar"}
        </button>
      </form>
    </div>
  );
}
