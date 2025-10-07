export default function Header() {
    return (
      <div className="w-full border-b border-gray-200 bg-white/90 backdrop-blur">
        <div className="mx-auto max-w-7xl px-4 h-12 flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="inline-flex h-6 w-6 items-center justify-center rounded bg-[#0D3B66] text-white">≋</span>
            <span className="font-semibold text-[#0D3B66]">Nautic</span>
            <span className="text-sm text-gray-500">Costa Atlántica Argentina</span>
          </div>
          <div className="ml-auto text-sm text-gray-500">
            Seleccioná un deporte en el mapa para ver condiciones óptimas
          </div>
        </div>
      </div>
    );
  }
  