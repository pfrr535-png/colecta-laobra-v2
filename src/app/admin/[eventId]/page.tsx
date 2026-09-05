import Header from "@/components/Header";
import { supabase } from "@/lib/supabaseClient";
import { EventRow } from "@/lib/types";
import AdminEvent from "./AdminEvent";

export default async function AdminEventPage({
  params,
  searchParams,
}: PageProps<"/admin/[eventId]">) {
  const { eventId } = await params;
  const sp = await searchParams;
  const key = typeof sp.key === "string" ? sp.key : "";
  const masterKey = process.env.ADMIN_KEY;

  const { data: event } = await supabase
    .from("events")
    .select("*")
    .eq("id", eventId)
    .single();

  if (!event) {
    return (
      <>
        <Header subtitle="Panel de administración" />
        <main className="mx-auto flex w-full max-w-md flex-1 flex-col items-center justify-center gap-3 px-4 text-center">
          <h1 className="text-xl font-bold text-navy">Colecta no encontrada</h1>
        </main>
      </>
    );
  }

  const eventRow = event as EventRow;
  const authorized =
    !!key && (key === eventRow.admin_key || (!!masterKey && key === masterKey));

  if (!authorized) {
    return (
      <>
        <Header subtitle="Panel de administración" />
        <main className="mx-auto flex w-full max-w-md flex-1 flex-col items-center justify-center gap-3 px-4 text-center">
          <h1 className="text-xl font-bold text-navy">Acceso denegado</h1>
          <p className="text-sm text-gray-600">
            El enlace no incluye una clave de administrador válida para esta
            colecta.
          </p>
        </main>
      </>
    );
  }

  return (
    <>
      <Header subtitle="Panel de administración" />
      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-6">
        <AdminEvent eventId={eventId} adminKey={key} initialEvent={eventRow} />
      </main>
    </>
  );
}
