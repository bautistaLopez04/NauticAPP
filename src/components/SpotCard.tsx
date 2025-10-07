type WeatherData = {
  temperature_2m?: number;
  wind_speed_10m?: number;
  precipitation?: number;
  wave_height?: number | null;
};

type SpotCardProps = {
  spot: { name: string } | null;
  data?: WeatherData;
  onClose: () => void;
};

export default function SpotCard({ spot, data, onClose }: SpotCardProps) {
  if (!spot) return null;

  return (
    <div className="absolute top-0 right-0 h-full w-full sm:w-[400px] bg-white/95 backdrop-blur-md border-l border-gray-200 shadow-xl z-10 animate-slide-in">
      {/* HEADER */}
      <div className="flex justify-between items-center p-5 border-b border-gray-100">
        <h2 className="text-xl font-semibold text-[#0D3B66]">{spot.name}</h2>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600 transition"
        >
          ✕
        </button>
      </div>

      {/* BODY */}
      {data ? (
        <div className="p-6 flex flex-col gap-5 text-gray-700">
          <InfoRow label="Temperatura" value={`${data.temperature_2m} °C`} icon="🌡️" />
          <InfoRow label="Viento" value={`${data.wind_speed_10m} m/s`} icon="💨" />
          <InfoRow label="Lluvia" value={`${data.precipitation} mm`} icon="🌧️" />
          <InfoRow label="Altura de olas" value={`${data.wave_height} m`} icon="🌊" />
        </div>
      ) : (
        <p className="p-6 text-gray-500">Cargando datos...</p>
      )}

      {/* FOOTER */}
      <div className="p-5 border-t border-gray-100">
        <button
          onClick={onClose}
          className="btn bg-[#0D3B66] text-white border-none hover:bg-[#124b85] w-full"
        >
          Cerrar
        </button>
      </div>
    </div>
  );
}

// === Componente auxiliar (línea de info) ===
function InfoRow({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon: string;
}) {
  return (
    <div className="flex justify-between items-center border-b border-gray-50 pb-2">
      <div className="flex items-center gap-3">
        <span className="text-xl">{icon}</span>
        <span className="text-gray-600">{label}</span>
      </div>
      <span className="text-lg font-medium text-[#0D3B66]">{value}</span>
    </div>
  );
}
