import Header from "@/components/Header";
import { supabase } from "@/lib/supabaseClient";
import { EventRow } from "@/lib/types";
import VolunteerApp from "./VolunteerApp";

export default async function ColectaPage({
  params,
}: PageProps<"/colecta/[eventId]">) {
  const { eventId } = await params;

  const { data: event } = await supabase
    .from("events")
    .select("*")
    .eq("id", eventId)
    .single();

  if (!event) {
    return (
      <>
        <Header />
        <main className="mx-auto flex w-full max-w-md flex-1 flex-col items-center justify-center gap-3 px-4 text-center">
          <h1 className="text-xl font-bold text-navy">Colecta no encontrada</h1>
          <p className="text-sm text-gray-600">
            Verifica el enlace que recibiste del equipo organizador.
          </p>
        </main>
      </>
    );
  }

  return (
    <>
      <Header subtitle={(event as EventRow).name} />
      <main className="mx-auto w-full max-w-md flex-1 px-4 py-6">
        <VolunteerApp eventId={eventId} event={event as EventRow} />
      </main>
    </>
  );
}
