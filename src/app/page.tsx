import Header from "@/components/Header";

export default function Home() {
  return (
    <>
      <Header />
      <main className="mx-auto flex w-full max-w-md flex-1 flex-col items-center justify-center gap-3 px-4 text-center">
        <h1 className="text-xl font-bold text-navy">Colecta La Obra UC</h1>
        <p className="text-sm text-gray-600">
          Esta aplicación se utiliza a través de enlaces específicos
          compartidos por el equipo organizador. Si eres voluntario/a, pide el
          enlace de tu colecta. Si eres administrador/a, accede con tu clave
          en <span className="font-mono">/admin?key=...</span>.
        </p>
      </main>
    </>
  );
}
