interface Props {
  nombre: string;
  nivel: string;
}

export function DashboardHeader({ nombre, nivel }: Props) {
  return (
    <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h1 className="text-3xl sm:text-4xl font-bold text-manto-teal">
          Hola, {nombre}
        </h1>
        <p className="text-manto-teal/60 text-base sm:text-lg">Bienvenido a tu espacio personal.</p>
      </div>
      {/* 👇 En celu ocupa todo el ancho (w-full), en PC se ajusta (sm:w-fit) */}
      <div className="bg-manto-teal text-white px-5 py-3 sm:px-6 rounded-2xl flex items-center justify-center sm:justify-start gap-3 shadow-lg w-full sm:w-fit">
        <span className="text-2xl">🌿</span>
        <div className="text-left">
          <p className="text-[10px] sm:text-xs uppercase tracking-wider opacity-80 leading-tight">Nivel</p>
          <p className="font-bold text-sm sm:text-base leading-tight">{nivel}</p>
        </div>
      </div>
    </div>
  );
}