import Header from "@/components/Header";
import AdminHome from "./AdminHome";

export default async function AdminPage({
  searchParams,
}: PageProps<"/admin">) {
  const params = await searchParams;
  const key = typeof params.key === "string" ? params.key : "";
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
        <AdminHome adminKey={key} />
      </main>
    </>
  );
}
