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

type WeatherData = {
  temperature_2m?: number;
  wind_speed_10m?: number;
  precipitation?: number;
  wave_height?: number;
};

export default function MapView() {
  const [spots, setSpots] = useState<Spot[]>([]);
  const [data, setData] = useState<Record<string, WeatherData>>({});
  const [selected, setSelected] = useState<string | null>(null);
  const [selectedSports, setSelectedSports] = useState<string[]>([]);
  const [day, setDay] = useState(0);
  const navigate = useNavigate();

  // 1️⃣ Cargar spots desde el backend
  useEffect(() => {
    const fetchSpots = async () => {
      const res = await fetch("http://127.0.0.1:8000/spots");
      const backendSpots = await res.json();
      setSpots(backendSpots);
    };
    fetchSpots();
  }, []);

  // 2️⃣ Cargar datos meteo desde backend
  useEffect(() => {
    const fetchWeather = async () => {
      const results: Record<string, WeatherData> = {};
      for (const spot of spots) {
        try {
          const url = `http://127.0.0.1:8000/spots/weather_average_mon?lat=${spot.lat}&lon=${spot.lon}&day=${day}`;
          const res = await fetch(url);
          const json = await res.json();
          results[spot.name] = json;
        } catch {
          results[spot.name] = {};
        }
      }
      setData(results);
    };
    if (spots.length > 0) fetchWeather();
  }, [spots, day]);

  // 3️⃣ Filtro por deporte
  const visibleSpots = useMemo(() => {
    if (selectedSports.length === 0) return spots;
    return spots.filter((s) => s.sports.some((sport) => selectedSports.includes(sport)));
  }, [selectedSports, spots]);

  const selectedSpot = visibleSpots.find((s) => s.name === selected);

  const toggleSport = (sport: string) => {
    setSelectedSports((prev) =>
      prev.includes(sport) ? prev.filter((s) => s !== sport) : [...prev, sport]
    );
  };
  const resetSports = () => setSelectedSports([]);

  return (
    <div className="relative flex-1 min-h-0 w-full">
      {/* === FILTROS === */}
      <div className="fixed z-[1100] right-4 top-[calc(64px+16px)] pointer-events-none">
        <div className="flex flex-col gap-3 pointer-events-auto items-end">

          {/* Filtro de deporte */}
          <div className="flex gap-2">
            {["surf", "kite"].map((sport) => (
              <button
                key={sport}
                onClick={() => toggleSport(sport)}
                className={`w-[90px] px-4 py-2 rounded-md text-sm font-medium shadow transition-all border ${
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
              className="w-[40px] px-2 py-2 rounded-md text-sm font-bold shadow transition-all border bg-white text-[#0D3B66] border-slate-300 hover:bg-slate-50"
            >
              ×
            </button>
          </div>

          {/* Filtro de día con DaisyUI select */}
          <select
            className="select select-bordered select-sm bg-white text-[#0D3B66] w-[180px] border-slate-300"
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

        {/* MARCADORES */}
        {visibleSpots.map((spot) => {
          const d = data[spot.name];
          const wind = d?.wind_speed_10m ?? 0;
          const waves = d?.wave_height ?? 0;
          const rain = d?.precipitation ?? 0;
          const sport = pickSportForSpot(selectedSports, spot.sports);
          const apt = calcAptitude(sport, wind, waves, rain);
          const color = aptColor(apt);

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

        {/* POPUP */}
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

              {data[selectedSpot.name] ? (
                <>
                  <div className="text-xs text-slate-500">
                    Día {day} • Deporte:{" "}
                    <span className="font-semibold">
                      {pickSportForSpot(selectedSports, selectedSpot.sports).toUpperCase()}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-sm text-gray-700 mt-2">
                    <Info icon={<Thermometer className="w-4 h-4 text-[#0D3B66]" />} label="Temp prom." value={`${data[selectedSpot.name].temperature_2m}°C`} />
                    <Info icon={<Wind className="w-4 h-4 text-[#0D3B66]" />} label="Viento prom." value={`${data[selectedSpot.name].wind_speed_10m} m/s`} />
                    <Info icon={<CloudRain className="w-4 h-4 text-[#0D3B66]" />} label="Lluvia prom." value={`${data[selectedSpot.name].precipitation} mm`} />
                    <Info icon={<Waves className="w-4 h-4 text-[#0D3B66]" />} label="Olas prom." value={`${data[selectedSpot.name].wave_height} m`} />
                  </div>
                </>
              ) : (
                <p className="text-gray-400 text-sm">Cargando datos…</p>
              )}

              <button
                className="w-full bg-[#0D3B66] text-white py-2 rounded-md text-sm font-medium hover:bg-[#0b3355] transition"
                onClick={() => navigate(`/forecast/${encodeURIComponent(selectedSpot.name)}`)}
              >
                Ver Pronóstico Completo
              </button>

              {/* === NEWSLETTER === */}
              <div className="bg-white rounded-lg p-3 mt-3 border border-slate-200 shadow-sm">
                <p className="text-[13px] text-[#0D3B66] font-medium mb-2 text-center">
                  Recibí alertas de <span className="font-semibold">{selectedSpot.name}</span>
                </p>

                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    const email = (e.target as HTMLFormElement).email.value;
                    alert(`Suscripto a ${selectedSpot.name}: ${email}`);
                    (e.target as HTMLFormElement).reset();
                  }}
                  className="join w-full"
                >
                  <label className="input validator join-item flex-1 bg-white border border-slate-300">
                    <svg
                      className="h-[1em] opacity-50 mr-1"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                    >
                      <g
                        strokeLinejoin="round"
                        strokeLinecap="round"
                        strokeWidth="2.2"
                        fill="none"
                        stroke="currentColor"
                      >
                        <rect width="20" height="16" x="2" y="4" rx="2"></rect>
                        <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"></path>
                      </g>
                    </svg>
                    <input
                      type="email"
                      name="email"
                      placeholder="mail@site.com"
                      required
                      className="bg-transparent text-sm flex-1 outline-none"
                    />
                  </label>
                  <button
  type="submit"
  className="btn join-item bg-[#0D3B66] text-white border-[#0D3B66] hover:bg-[#0b3355] text-sm px-4 h-[40px] min-h-[40px]"
>
  Join
</button>

                </form>
              </div>
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
  return label === "excelente" ? "#16a34a" : label === "bueno" ? "#f59e0b" : "#dc2626";
}

function pickSportForSpot(selectedSports: string[], spotSports: Sport[]): Sport {
  if (selectedSports.length === 1 && spotSports.includes(selectedSports[0] as Sport)) {
    return selectedSports[0] as Sport;
  }
  return spotSports[0];
}
