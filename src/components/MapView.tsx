import { useEffect, useMemo, useState } from "react";
import { MapContainer, TileLayer, CircleMarker, Tooltip, Popup } from "react-leaflet";
import { Thermometer, Wind, CloudRain, Waves } from "lucide-react";
import "leaflet/dist/leaflet.css";
import { useNavigate } from "react-router-dom";

type Sport = "surf" | "kite";

type Spot = {
  name: string;
  lat: number;
  lon: number;
  sports: Sport[];
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

// ==== Tipos de datos ====
type HourlyData = {
  time: string[];
  temperature_2m?: number[];
  wind_speed_10m?: number[];
  precipitation?: number[];
  wave_height?: number[] | null;
};

type SpotData = {
  current: {
    temperature_2m?: number;
    wind_speed_10m?: number;
    precipitation?: number;
    wave_height?: number | null;
  };
  hourly: HourlyData;
};

// ==== Componente principal ====
export default function MapView() {
  const [data, setData] = useState<Record<string, SpotData>>({});
  const [selected, setSelected] = useState<string | null>(null);
  const [selectedSports, setSelectedSports] = useState<string[]>([]);
  const [day, setDay] = useState(0); // 0 = hoy, 1 = mañana...
  const navigate = useNavigate();

  // === CARGA DE DATOS (7 días) ===
  useEffect(() => {
    const fetchAll = async () => {
      const results: Record<string, SpotData> = {};
      for (const spot of SPOTS) {
        try {
          const wRes = await fetch(
            `https://api.open-meteo.com/v1/forecast?latitude=${spot.lat}&longitude=${spot.lon}&current=temperature_2m,wind_speed_10m,precipitation&hourly=temperature_2m,wind_speed_10m,precipitation&forecast_days=7&timezone=auto`
          );
          const w = await wRes.json();

          const mRes = await fetch(
            `https://marine-api.open-meteo.com/v1/marine?latitude=${spot.lat}&longitude=${spot.lon}&hourly=wave_height&forecast_days=7&timezone=auto`
          );
          const m = await mRes.json();

          results[spot.name] = {
            current: {
              temperature_2m: w?.current?.temperature_2m,
              wind_speed_10m: w?.current?.wind_speed_10m,
              precipitation: w?.current?.precipitation,
              wave_height: m?.hourly?.wave_height?.[0] ?? null,
            },
            hourly: {
              time: w?.hourly?.time ?? [],
              temperature_2m: w?.hourly?.temperature_2m ?? [],
              wind_speed_10m: w?.hourly?.wind_speed_10m ?? [],
              precipitation: w?.hourly?.precipitation ?? [],
              wave_height: m?.hourly?.wave_height ?? [],
            },
          };
        } catch {
          results[spot.name] = {
            current: {},
            hourly: { time: [], temperature_2m: [], wind_speed_10m: [], precipitation: [], wave_height: [] },
          };
        }
      }
      setData(results);
    };
    fetchAll();
  }, []);

  // === FILTRO POR DEPORTE ===
  const visibleSpots = useMemo(() => {
    if (selectedSports.length === 0) return SPOTS;
    return SPOTS.filter((s) =>
      s.sports.some((sport) => selectedSports.includes(sport))
    );
  }, [selectedSports]);

  const selectedSpot = visibleSpots.find((s) => s.name === selected);

  const toggleSport = (sport: string) => {
    setSelectedSports((prev) =>
      prev.includes(sport)
        ? prev.filter((s) => s !== sport)
        : [...prev, sport]
    );
  };
  const resetSports = () => setSelectedSports([]);

  return (
    <div className="relative flex-1 min-h-0 w-full">

      {/* === FILTROS Y SELECTOR DE DÍA === */}
      <div className="fixed z-[1100] right-4 top-[calc(64px+16px)] pointer-events-none">
        <div className="flex flex-col gap-2 pointer-events-auto items-end">
          <div className="flex gap-2">
            {["surf", "kite"].map((sport) => (
              <button
                key={sport}
                onClick={() => toggleSport(sport)}
                className={`w-[90px] px-4 py-2 rounded-md text-sm font-medium shadow transition-all border
                  ${
                    selectedSports.includes(sport)
                      ? "bg-[#0D3B66] text-white border-[#0D3B66]"
                      : "bg-white text-[#0D3B66] border-slate-300 hover:bg-slate-50"
                  }`}
              >
                {sport.charAt(0).toUpperCase() + sport.slice(1)}
              </button>
            ))}

            <button
              onClick={resetSports}
              className="w-[90px] px-4 py-2 rounded-md text-sm font-medium shadow transition-all border
                bg-white text-[#0D3B66] border-slate-300 hover:bg-slate-50"
            >
              ×
            </button>
          </div>

          {/* Selector de día */}
          <select
            className="bg-white border border-slate-300 text-[#0D3B66] rounded-md text-sm px-2 py-1"
            value={day}
            onChange={(e) => setDay(Number(e.target.value))}
          >
            {[...Array(7)].map((_, i) => (
              <option key={i} value={i}>
                Día {i === 0 ? "0 (hoy)" : `+${i}`}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* === MAPA === */}
      <MapContainer
        center={[-37.8, -58.0]}
        zoom={7}
        className="h-full w-full z-0"
        style={{ minHeight: "calc(100vh - 180px)" }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; OpenStreetMap contributors'
        />

        {/* === MARCADORES === */}
        {visibleSpots.map((spot) => {
          const d = data[spot.name];
          const windArr = daySlice(d?.hourly?.wind_speed_10m, day);
          const waveArr = daySlice(d?.hourly?.wave_height ?? undefined, day);
          const rainArr = daySlice(d?.hourly?.precipitation, day);

          const wind = avg(windArr);
          const waves = avg(waveArr);
          const rain = avg(rainArr);

          const sport = pickSportForSpot(selectedSports, spot.sports);
          const apt = calcAptitude(sport, wind, waves, rain);
          const color = Number.isNaN(wind) ? "#94a3b8" : aptColor(apt);

          return (
            <CircleMarker
              key={spot.name}
              center={[spot.lat, spot.lon]}
              radius={6}
              pathOptions={{ color, fillColor: color, fillOpacity: 0.9, weight: 2 }}
              eventHandlers={{ click: () => setSelected(spot.name) }}
            >
              <Tooltip permanent direction="bottom" offset={[0, 14]} className="spot-chip">
                {spot.name}
              </Tooltip>
            </CircleMarker>
          );
        })}

        {/* === POPUP === */}
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
              <h3 className="font-semibold text-[#0D3B66]">{selectedSpot.name}</h3>

              {(() => {
                const d = data[selectedSpot.name];
                const wind = avg(daySlice(d?.hourly?.wind_speed_10m, day));
                const waves = avg(daySlice(d?.hourly?.wave_height ?? undefined, day));
                const rain = avg(daySlice(d?.hourly?.precipitation, day));
                const temp = avg(daySlice(d?.hourly?.temperature_2m, day));

                const sport = pickSportForSpot(selectedSports, selectedSpot.sports);
                const apt = calcAptitude(sport, wind, waves, rain);

                return Number.isNaN(wind) ? (
                  <p className="text-gray-400 text-sm">Cargando datos…</p>
                ) : (
                  <>
                    <div className="text-xs text-slate-500">
                      Día {day} • Deporte:{" "}
                      <span className="font-semibold">{sport.toUpperCase()}</span> • Aptitud:{" "}
                      <span
                        className={`font-semibold ${
                          apt === "excelente"
                            ? "text-green-600"
                            : apt === "bueno"
                            ? "text-amber-600"
                            : "text-red-600"
                        }`}
                      >
                        {apt}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-3 text-sm text-gray-700 mt-2">
                      <Info
                        icon={<Thermometer className="w-4 h-4 text-[#0D3B66]" />}
                        label="Temp prom."
                        value={`${temp?.toFixed(1)}°C`}
                      />
                      <Info
                        icon={<Wind className="w-4 h-4 text-[#0D3B66]" />}
                        label="Viento prom."
                        value={`${wind?.toFixed(1)} m/s`}
                      />
                      <Info
                        icon={<CloudRain className="w-4 h-4 text-[#0D3B66]" />}
                        label="Lluvia prom."
                        value={`${rain?.toFixed(1)} mm`}
                      />
                      <Info
                        icon={<Waves className="w-4 h-4 text-[#0D3B66]" />}
                        label="Olas prom."
                        value={`${(waves ?? NaN).toFixed(1)} m`}
                      />
                    </div>
                  </>
                );
              })()}

              <button
                className="w-full bg-[#0D3B66] text-white py-2 rounded-md text-sm font-medium hover:bg-[#0b3355] transition"
                onClick={() => navigate(`/forecast/${encodeURIComponent(selectedSpot.name)}`)}
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

/* === COMPONENTE INFO === */
function Info({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex flex-col items-center">
      {icon}
      <span className="text-[11px] text-gray-500">{label}</span>
      <span className="text-[13px] font-medium text-[#0D3B66]">{value}</span>
    </div>
  );
}

/* === HELPERS === */
const daySlice = (arr: number[] | undefined, day: number) => {
  if (!arr || arr.length === 0) return [];
  const start = day * 24;
  return arr.slice(start, start + 24);
};

const avg = (arr: number[]) =>
  arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : NaN;

type AptLabel = "excelente" | "bueno" | "malo";

function calcAptitude(sport: "surf" | "kite", wind: number, waves: number, rain: number): AptLabel {
  if (sport === "surf") {
    if (waves >= 1.2 && wind < 8 && rain < 2) return "excelente";
    if (waves >= 0.7 && wind < 12 && rain < 4) return "bueno";
    return "malo";
  }
  if (wind >= 8 && wind <= 14 && rain < 2) return "excelente";
  if (wind >= 6 && rain < 4) return "bueno";
  return "malo";
}

function aptColor(label: AptLabel) {
  return label === "excelente"
    ? "#16a34a"
    : label === "bueno"
    ? "#f59e0b"
    : "#dc2626";
}

function pickSportForSpot(selectedSports: string[], spotSports: Sport[]): Sport {
  if (selectedSports.length === 1 && spotSports.includes(selectedSports[0] as Sport)) {
    return selectedSports[0] as Sport;
  }
  if (selectedSports.length > 1) {
    const found = selectedSports.find((s) => spotSports.includes(s as Sport));
    if (found) return found as Sport;
  }
  return spotSports[0];
}
