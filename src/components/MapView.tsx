import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import * as L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Thermometer, Wind, CloudRain, Waves } from "lucide-react";

// ==== ICONO PERSONALIZADO ====
const icon = new L.Icon({
  iconUrl: "https://cdn-icons-png.flaticon.com/512/25/25613.png",
  iconSize: [26, 26],
  iconAnchor: [13, 26],
});

// ==== LUGARES ====
const SPOTS = [
  { name: "Mar del Plata", lat: -38.0023, lon: -57.5575 },
  { name: "Pinamar", lat: -37.1081, lon: -56.8611 },
  { name: "Villa Gesell", lat: -37.2639, lon: -56.9736 },
  { name: "Mar de las Pampas", lat: -37.3273, lon: -57.0217 },
  { name: "Miramar", lat: -38.2707, lon: -57.8364 },
  { name: "Necochea", lat: -38.5545, lon: -58.7396 },
];

type WeatherData = {
  temperature_2m?: number;
  wind_speed_10m?: number;
  precipitation?: number;
  wave_height?: number | null;
};

export default function MapView() {
  const [data, setData] = useState<Record<string, WeatherData>>({});

  // === OBTENER DATOS ===
  useEffect(() => {
    const fetchData = async () => {
      const results: Record<string, WeatherData> = {};
      for (const spot of SPOTS) {
        try {
          const weatherRes = await fetch(
            `https://api.open-meteo.com/v1/forecast?latitude=${spot.lat}&longitude=${spot.lon}&current=temperature_2m,wind_speed_10m,precipitation`
          );
          const weatherJson = await weatherRes.json();

          const marineRes = await fetch(
            `https://marine-api.open-meteo.com/v1/marine?latitude=${spot.lat}&longitude=${spot.lon}&hourly=wave_height&forecast_days=1`
          );
          const marineJson = await marineRes.json();

          const wave = marineJson.hourly?.wave_height?.[0] ?? null;

          results[spot.name] = {
            temperature_2m: weatherJson?.current?.temperature_2m,
            wind_speed_10m: weatherJson?.current?.wind_speed_10m,
            precipitation: weatherJson?.current?.precipitation,
            wave_height: wave,
          };
        } catch {
          results[spot.name] = {};
        }
      }
      setData(results);
    };
    fetchData();
  }, []);

  return (
    <div className="relative w-full h-full">
      <MapContainer
        center={[-37.6, -57.0]}
        zoom={7}
        className="h-full w-full z-0"
      >
        <TileLayer
          attribution='&copy; OpenStreetMap contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {SPOTS.map((spot) => (
          <Marker key={spot.name} position={[spot.lat, spot.lon]} icon={icon}>
            <Popup autoPan={false} closeButton={false}>
              <div className="bg-white/95 rounded-2xl shadow-xl p-4 w-[220px] space-y-2">
                <h3 className="text-base font-semibold text-[#0D3B66]">
                  📍 {spot.name}
                </h3>

                {data[spot.name] ? (
                  <div className="grid grid-cols-2 gap-3 text-sm text-gray-700">
                    <InfoItem
                      icon={<Thermometer className="w-4 h-4 text-[#0D3B66]" />}
                      label="Temp"
                      value={`${data[spot.name].temperature_2m}°C`}
                    />
                    <InfoItem
                      icon={<Wind className="w-4 h-4 text-[#0D3B66]" />}
                      label="Viento"
                      value={`${data[spot.name].wind_speed_10m} m/s`}
                    />
                    <InfoItem
                      icon={<CloudRain className="w-4 h-4 text-[#0D3B66]" />}
                      label="Lluvia"
                      value={`${data[spot.name].precipitation} mm`}
                    />
                    <InfoItem
                      icon={<Waves className="w-4 h-4 text-[#0D3B66]" />}
                      label="Olas"
                      value={`${data[spot.name].wave_height} m`}
                    />
                  </div>
                ) : (
                  <p className="text-gray-400 text-sm">Cargando datos...</p>
                )}
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}

function InfoItem({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex flex-col items-center">
      {icon}
      <span className="text-[11px] text-gray-500">{label}</span>
      <span className="text-[13px] font-medium text-[#0D3B66]">{value}</span>
    </div>
  );
}
