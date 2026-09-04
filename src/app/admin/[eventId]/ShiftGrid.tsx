"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { SHIFT_SLOTS } from "@/lib/constants";
import { ShiftRow } from "@/lib/types";

export default function ShiftGrid({
  supermarketId,
  onCountChange,
}: {
  supermarketId: string;
  onCountChange?: (count: number) => void;
}) {
  const [shifts, setShifts] = useState<ShiftRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [pending, setPending] = useState<string | null>(null);

  async function loadShifts() {
    setLoading(true);
    const { data, error } = await supabase
      .from("shifts")
      .select("*")
      .eq("supermarket_id", supermarketId);
    if (!error && data) {
      setShifts(data as ShiftRow[]);
      onCountChange?.(data.length);
    }
    setLoading(false);
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadShifts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [supermarketId]);

  function findShift(startTime: string) {
    return shifts.find((s) => s.start_time === startTime);
  }

  async function toggleSlot(startTime: string, endTime: string) {
    setPending(startTime);
    const existing = findShift(startTime);
    if (existing) {
      await supabase.from("shifts").delete().eq("id", existing.id);
    } else {
      await supabase.from("shifts").insert({
        supermarket_id: supermarketId,
        start_time: startTime,
        end_time: endTime,
      });
    }
    await loadShifts();
    setPending(null);
  }

  if (loading) {
    return <p className="text-sm text-gray-500">Cargando turnos...</p>;
  }

  return (
    <div className="grid grid-cols-3 gap-2 sm:grid-cols-3">
      {SHIFT_SLOTS.map((slot) => {
        const active = !!findShift(slot.start_time);
        return (
          <button
            key={slot.start_time}
            type="button"
            disabled={pending === slot.start_time}
            onClick={() => toggleSlot(slot.start_time, slot.end_time)}
            className={`rounded-lg border px-2 py-2 text-xs font-semibold transition disabled:opacity-50 ${
              active
                ? "border-orange bg-orange text-white"
                : "border-gray-300 bg-white text-gray-500"
            }`}
          >
            {slot.label}
          </button>
        );
      })}
    </div>
  );
}
