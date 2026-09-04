import Header from "@/components/Header";
import AdminEvent from "./AdminEvent";

export default async function AdminEventPage({
  params,
  searchParams,
}: PageProps<"/admin/[eventId]">) {
  const { eventId } = await params;
  const sp = await searchParams;
  const key = typeof sp.key === "string" ? sp.key : "";
  const adminKey = process.env.ADMIN_KEY;

  if (!adminKey || key !== adminKey) {
    return (
      <>
        <Header subtitle="Panel de administración" />
        <main className="mx-auto flex w-full max-w-md flex-1 flex-col items-center justify-center gap-3 px-4 text-center">
          <h1 className="text-xl font-bold text-navy">Acceso denegado</h1>
          <p className="text-sm text-gray-600">
            El enlace no incluye una clave de administrador válida.
          </p>
        </main>
      </>
    );
  }

  return (
    <>
      <Header subtitle="Panel de administración" />
      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-6">
        <AdminEvent eventId={eventId} adminKey={key} />
      </main>
    </>
  );
}
