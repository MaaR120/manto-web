import { Clock, CreditCard } from "lucide-react";

interface Props {
  data: {
    estado: string;
    proximoCobro: string;
  } | null;
}

export function SubscriptionCard({ data }: Props) {
  if (!data) {
    return (
        <div className="bg-white/50 backdrop-blur-md p-8 rounded-3xl border border-manto-teal/10 text-center flex flex-col items-center justify-center h-full min-h-[200px]">
            <p className="text-gray-500 mb-4 font-medium">No eres miembro del Club Manto</p>
            <button className="bg-manto-orange text-white px-6 py-3 rounded-xl font-bold shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all">
                Unirme al Club
            </button>
        </div>
    )
  }

  return (
    <div className="bg-manto-teal text-white p-8 rounded-3xl shadow-lg relative overflow-hidden group h-full">
      <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-10 -mt-10 blur-2xl group-hover:bg-white/20 transition-all"></div>
      
      <h2 className="text-xl font-bold mb-2 flex items-center gap-2">
        <Clock size={20} /> Club MANTO
      </h2>
      
      <p className="text-white/80 text-sm mb-6">
        Próximo envío: <strong>{data.proximoCobro}</strong>
      </p>
      
      <div className="flex items-center justify-between bg-white/10 p-4 rounded-xl backdrop-blur-sm border border-white/20 mt-auto">
        <div className="flex items-center gap-3">
           <CreditCard size={20} />
           <span className="text-sm font-medium">•••• 4242</span>
        </div>
        <span className="text-xs bg-manto-orange px-2 py-1 rounded text-white font-bold uppercase">
            {data.estado}
        </span>
      </div>
    </div>
  );
}