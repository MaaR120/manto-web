interface Props {
  nombre: string;
  nivel: string;
}

export function DashboardHeader({ nombre, nivel }: Props) {
  return (
    <div className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div>
        <h1 className="text-4xl font-bold text-manto-teal">
          Hola, {nombre}
        </h1>
        <p className="text-manto-teal/60 text-lg">Bienvenido a tu espacio personal.</p>
      </div>
      <div className="bg-manto-teal text-white px-6 py-3 rounded-2xl flex items-center gap-3 shadow-lg w-fit">
        <span className="text-2xl">🌿</span>
        <div>
          <p className="text-xs uppercase tracking-wider opacity-80">Nivel</p>
          <p className="font-bold">{nivel}</p>
        </div>
      </div>
    </div>
  );
}