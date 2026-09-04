"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { EventRow, ItemRow } from "@/lib/types";
import { useToasts, ToastStack } from "@/components/Toast";
import OnboardingForm, { VolunteerSession } from "./OnboardingForm";
import LiveCounter from "./LiveCounter";
import FoodSection from "./FoodSection";
import HygieneSection from "./HygieneSection";
import SessionList from "./SessionList";

function storageKey(eventId: string) {
  return `colecta_session_${eventId}`;
}

export default function VolunteerApp({
  eventId,
  event,
}: {
  eventId: string;
  event: EventRow;
}) {
  const [session, setSession] = useState<VolunteerSession | null>(null);
  const [sessionItems, setSessionItems] = useState<ItemRow[]>([]);
  const [hydrated, setHydrated] = useState(false);
  const { toasts, showToast } = useToasts();

  useEffect(() => {
    const raw = sessionStorage.getItem(storageKey(eventId));
    if (raw) {
      try {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setSession(JSON.parse(raw) as VolunteerSession);
      } catch {
        // ignore corrupt data
      }
    }
    setHydrated(true);
  }, [eventId]);

  function handleJoin(s: VolunteerSession) {
    setSession(s);
    sessionStorage.setItem(storageKey(eventId), JSON.stringify(s));
  }

  function handleAdded(item: ItemRow) {
    setSessionItems((prev) => [item, ...prev]);
    showToast(`✓ ${item.product_name} agregado`);
  }

  async function handleDelete(id: string) {
    await supabase.from("items").delete().eq("id", id);
    setSessionItems((prev) => prev.filter((i) => i.id !== id));
  }

  if (!hydrated) return null;

  if (!session) {
    return <OnboardingForm eventId={eventId} onJoin={handleJoin} />;
  }

  return (
    <div className="flex flex-col gap-4 pb-8">
      <div className="rounded-xl bg-white p-3 text-sm shadow-sm">
        <p className="font-semibold text-navy">
          {session.name} · {session.supermarketName}
        </p>
        <p className="text-gray-500">
          {event.name} · Turno {session.shiftLabel}
        </p>
      </div>

      <LiveCounter
        supermarketId={session.supermarketId}
        supermarketName={session.supermarketName}
      />

      <FoodSection
        volunteerId={session.volunteerId}
        supermarketId={session.supermarketId}
        shiftId={session.shiftId}
        onAdded={handleAdded}
      />

      <HygieneSection
        volunteerId={session.volunteerId}
        supermarketId={session.supermarketId}
        shiftId={session.shiftId}
        onAdded={handleAdded}
      />

      <SessionList items={sessionItems} onDelete={handleDelete} />

      <ToastStack toasts={toasts} />
    </div>
  );
}
