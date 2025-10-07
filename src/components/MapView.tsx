import { useEffect, useMemo, useState } from "react";
import { MapContainer, TileLayer, CircleMarker, Tooltip, Popup } from "react-leaflet";
import { Thermometer, Wind, CloudRain, Waves } from "lucide-react";
import "leaflet/dist/leaflet.css";

type Sport = "surf" | "kite";
type Spot = {
  name: string;
  lat: number;
  lon: number;
  sports: Sport[];        // <- para filtros
};

const SPOTS: Spot[] = [
  { name: "San Clemente del Tuyú", lat: -36.3567, lon: -56.7233, sports: ["kite"] },
  { name: "Santa Teresita",        lat: -36.5417, lon: -56.7083, sports: ["surf","kite"] },
  { name: "San Bernardo",          lat: -36.7000, lon: -56.7000, sports: ["kite"] },
  { name: "Mar de Ajó",            lat: -36.7167, lon: -56.6833, sports: ["surf","kite"] },
  { name: "Mar de las Pampas",     lat: -37.3167, lon: -57.0167, sports: ["surf","kite"] },
  { name: "Cariló",                lat: -37.1833, lon: -56.9000, sports: ["surf","kite"] },
  { name: "Pinamar",               lat: -37.1094, lon: -56.8567, sports: ["surf","kite"] },
  { name: "Villa Gesell",          lat: -37.2645, lon: -56.9729, sports: ["surf","kite"] },
  { name: "Mar del Plata",         lat: -38.0055, lon: -57.5426, sports: ["surf","kite"] },
  { name: "Miramar",               lat: -38.2667, lon: -57.8333, sports: ["surf"] },
  { name: "Necochea",              lat: -38.5545, lon: -58.7390, sports: ["surf"] },
  { name: "Claromecó",             lat: -38.8667, lon: -60.0833, sports: ["surf"] },
  { name: "Monte Hermoso",         lat: -38.9833, lon: -61.2833, sports: ["surf"] },
];

type WeatherData = {
  temperature_2m?: number;
  wind_speed_10m?: number;
  precipitation?: number;
  wave_height?: number | null;
};

export default function MapView() {
  const [data, setData] = useState<Record<string, WeatherData>>({});
  const [selected, setSelected] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | Sport>("all");

  // === datos meteo ===
  useEffect(() => {
    const fetchAll = async () => {
      const results: Record<string, WeatherData> = {};
      for (const spot of SPOTS) {
        try {
          const weatherRes = await fetch(
            `https://api.open-meteo.com/v1/forecast?latitude=${spot.lat}&longitude=${spot.lon}&current=temperature_2m,wind_speed_10m,precipitation&timezone=auto`
          );
          const weatherJson = await weatherRes.json();

          const marineRes = await fetch(
            `https://marine-api.open-meteo.com/v1/marine?latitude=${spot.lat}&longitude=${spot.lon}&hourly=wave_height&forecast_days=1&timezone=auto`
          );
          const marineJson = await marineRes.json();

          results[spot.name] = {
            temperature_2m: weatherJson?.current?.temperature_2m,
            wind_speed_10m: weatherJson?.current?.wind_speed_10m,
            precipitation: weatherJson?.current?.precipitation,
            wave_height: marineJson?.hourly?.wave_height?.[0] ?? null,
          };
        } catch {
          results[spot.name] = {};
        }
      }
      setData(results);
    };
    fetchAll();
  }, []);

  // === aplicar filtro ===
  const visibleSpots = useMemo(() => {
    if (filter === "all") return SPOTS;
    return SPOTS.filter(s => s.sports.includes(filter));
  }, [filter]);

  const selectedSpot = visibleSpots.find(s => s.name === selected);

  return (
    <div className="relative h-full w-full">
      {/* Filtros (único set, funcional) */}
      <div className="absolute right-4 top-4 z-[400] flex gap-2">
        <button
          className={`rounded-md px-3 py-1.5 text-sm font-medium shadow ${filter==="all" ? "bg-[#0D3B66] text-white" : "bg-white/90 text-[#0D3B66] border"}`}
          onClick={() => setFilter("all")}
        >
          Todos
        </button>
        <button
          className={`rounded-md px-3 py-1.5 text-sm font-medium shadow ${filter==="surf" ? "bg-[#0D3B66] text-white" : "bg-white/90 text-[#0D3B66] border"}`}
          onClick={() => setFilter("surf")}
        >
          Surf
        </button>
        <button
          className={`rounded-md px-3 py-1.5 text-sm font-medium shadow ${filter==="kite" ? "bg-[#0D3B66] text-white" : "bg-white/90 text-[#0D3B66] border"}`}
          onClick={() => setFilter("kite")}
        >
          Kite
        </button>
      </div>

      <MapContainer center={[-37.8, -58.0]} zoom={7} className="h-full w-full z-0">
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; OpenStreetMap contributors'
        />

        {visibleSpots.map((spot) => (
          <CircleMarker
            key={spot.name}
            center={[spot.lat, spot.lon]}
            radius={6}
            pathOptions={{ color: "#0D3B66", weight: 2, fillColor: "#0D3B66", fillOpacity: 0.9 }}
            eventHandlers={{ click: () => setSelected(spot.name) }}
          >
            {/* chip blanco DEBAJO del punto */}
            <Tooltip
              permanent
              direction="bottom"
              offset={[0, 14]}
              className="spot-chip"
            >
              {spot.name}
            </Tooltip>
          </CircleMarker>
        ))}

        {selectedSpot && (
          <Popup
            position={[selectedSpot.lat, selectedSpot.lon]}
            offset={[0, -10]}
            autoPan
            keepInView
            closeButton
            className="spot-popup"
            eventHandlers={{ remove: () => setSelected(null) }}
          >
            <div className="w-[260px] space-y-2">
              <div className="mini-row">
                <h3 className="mini-title">📍 {selectedSpot.name}</h3>
                <button className="mini-close" onClick={() => setSelected(null)}>✕</button>
              </div>

              {data[selectedSpot.name] ? (
                <div className="grid grid-cols-2 gap-3 text-sm text-gray-700">
                  <Info icon={<Thermometer className="w-4 h-4 text-[#0D3B66]" />} label="Temp"
                        value={`${data[selectedSpot.name].temperature_2m}°C`} />
                  <Info icon={<Wind className="w-4 h-4 text-[#0D3B66]" />} label="Viento"
                        value={`${data[selectedSpot.name].wind_speed_10m} m/s`} />
                  <Info icon={<CloudRain className="w-4 h-4 text-[#0D3B66]" />} label="Lluvia"
                        value={`${data[selectedSpot.name].precipitation} mm`} />
                  <Info icon={<Waves className="w-4 h-4 text-[#0D3B66]" />} label="Olas"
                        value={`${data[selectedSpot.name].wave_height ?? "—"} m`} />
                </div>
              ) : (
                <p className="text-gray-400 text-sm">Cargando datos…</p>
              )}

              <button
                className="mini-button"
                onClick={() => alert("Aquí irá la página de pronóstico completo")}
              >
                Ver Pronóstico Completo
              </button>
            </div>
          </Popup>
        )}
      </MapContainer>
    </div>
  );
}

function Info({
  icon, label, value,
}: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex flex-col items-center">
      {icon}
      <span className="text-[11px] text-gray-500">{label}</span>
      <span className="text-[13px] font-medium text-[#0D3B66]">{value}</span>
    </div>
  );
}
