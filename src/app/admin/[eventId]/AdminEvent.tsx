"use client";

import { useState } from "react";
import { EventRow } from "@/lib/types";
import SupermarketsPanel from "./SupermarketsPanel";
import DashboardPanel from "./DashboardPanel";

type Tab = "supermarkets" | "dashboard" | "link";

export default function AdminEvent({
  eventId,
  adminKey,
  initialEvent,
}: {
  eventId: string;
  adminKey: string;
  initialEvent: EventRow;
}) {
  const [event] = useState<EventRow>(initialEvent);
  const [tab, setTab] = useState<Tab>("supermarkets");
  const [copiedVolunteer, setCopiedVolunteer] = useState(false);
  const [copiedAdmin, setCopiedAdmin] = useState(false);

  const volunteerPath = `/colecta/${eventId}`;
  const adminPath = `/admin/${eventId}?key=${encodeURIComponent(event.admin_key)}`;

  async function copyPath(
    path: string,
    setCopied: (v: boolean) => void
  ) {
    const url = `${window.location.origin}${path}`;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // ignore
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-xl font-bold text-navy">{event.name}</h1>
        <p className="text-sm text-gray-500">
          {new Date(event.date + "T00:00:00").toLocaleDateString("es-CL", {
            day: "2-digit",
            month: "long",
            year: "numeric",
          })}
        </p>
      </div>

      <nav className="flex gap-2 rounded-xl bg-white p-1 shadow-sm">
        {(
          [
            { key: "supermarkets", label: "Supermercados" },
            { key: "dashboard", label: "Dashboard" },
            { key: "link", label: "Enlace" },
          ] as { key: Tab; label: string }[]
        ).map((t) => (
          <button
            key={t.key}
            type="button"
            onClick={() => setTab(t.key)}
            className={`flex-1 rounded-lg py-2 text-sm font-semibold transition ${
              tab === t.key ? "bg-navy text-white" : "text-navy"
            }`}
          >
            {t.label}
          </button>
        ))}
      </nav>

      {tab === "supermarkets" && <SupermarketsPanel eventId={eventId} />}
      {tab === "dashboard" && (
        <DashboardPanel eventId={eventId} eventName={event.name} />
      )}
      {tab === "link" && (
        <div className="flex flex-col gap-4">
          <section className="rounded-xl bg-white p-4 shadow-sm">
            <h2 className="mb-2 text-lg font-bold text-navy">
              Enlace para voluntarios
            </h2>
            <p className="mb-3 text-sm text-gray-600">
              Comparte este enlace con los voluntarios de esta colecta.
            </p>
            <div className="mb-3 break-all rounded-lg bg-gray-100 p-3 text-sm text-navy">
              {volunteerPath}
            </div>
            <button
              type="button"
              onClick={() => copyPath(volunteerPath, setCopiedVolunteer)}
              className="h-12 w-full rounded-lg bg-orange text-base font-bold text-white shadow active:bg-orange-dark"
            >
              {copiedVolunteer ? "¡Copiado!" : "Copiar enlace"}
            </button>
          </section>

          <section className="rounded-xl bg-white p-4 shadow-sm">
            <h2 className="mb-2 text-lg font-bold text-navy">
              Enlace para quien coordine esta colecta
            </h2>
            <p className="mb-3 text-sm text-gray-600">
              Este enlace usa la clave de administrador propia de esta
              colecta ({event.admin_key}), sin dar acceso a las demás
              colectas.
            </p>
            <div className="mb-3 break-all rounded-lg bg-gray-100 p-3 text-sm text-navy">
              {adminPath}
            </div>
            <button
              type="button"
              onClick={() => copyPath(adminPath, setCopiedAdmin)}
              className="h-12 w-full rounded-lg bg-navy text-base font-bold text-white shadow active:bg-navy-dark"
            >
              {copiedAdmin ? "¡Copiado!" : "Copiar enlace"}
            </button>
          </section>
        </div>
      )}

      <p className="text-center text-xs text-gray-400">
        Sesión de administrador · clave: {adminKey.slice(0, 4)}••••
      </p>
    </div>
  );
}
