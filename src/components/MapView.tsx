import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker } from "react-leaflet";
import * as L from "leaflet";
import "leaflet/dist/leaflet.css";

// ==== ICONO PERSONALIZADO ====
const icon = new L.Icon({
  iconUrl: "https://cdn-icons-png.flaticon.com/512/684/684908.png", // ancla azul
  iconSize: [32, 32],
  iconAnchor: [16, 32],
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
  const [selectedSpot, setSelectedSpot] = useState<any>(null);
  const [data, setData] = useState<Record<string, WeatherData>>({});

  // === OBTENER DATOS DE CLIMA ===
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
      {/* === MAPA === */}
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
          <Marker
            key={spot.name}
            position={[spot.lat, spot.lon]}
            icon={icon}
            eventHandlers={{
              click: () => setSelectedSpot(spot),
            }}
          />
        ))}
      </MapContainer>

      {/* === PANEL LATERAL DE INFORMACIÓN === */}
      {selectedSpot && (
        <div className="absolute top-0 right-0 h-full w-full sm:w-[400px] bg-white/95 backdrop-blur-md shadow-2xl border-l border-gray-200 z-10 animate-slide-in">
          <div className="flex justify-between items-center p-4 border-b border-gray-300">
            <h2 className="text-xl font-bold text-[#0D3B66]">
              📍 {selectedSpot.name}
            </h2>
            <button
              onClick={() => setSelectedSpot(null)}
              className="btn btn-sm btn-circle btn-ghost text-gray-600"
            >
              ✕
            </button>
          </div>

          <div className="p-6 space-y-3 text-gray-700">
            {data[selectedSpot.name] ? (
              <>
                <div className="flex justify-between items-center border-b pb-2">
                  <span>🌡️ Temperatura</span>
                  <span className="font-semibold text-[#0D3B66]">
                    {data[selectedSpot.name].temperature_2m} °C
                  </span>
                </div>

                <div className="flex justify-between items-center border-b pb-2">
                  <span>💨 Viento</span>
                  <span className="font-semibold text-[#0D3B66]">
                    {data[selectedSpot.name].wind_speed_10m} m/s
                  </span>
                </div>

                <div className="flex justify-between items-center border-b pb-2">
                  <span>🌧️ Lluvia</span>
                  <span className="font-semibold text-[#0D3B66]">
                    {data[selectedSpot.name].precipitation} mm
                  </span>
                </div>

                <div className="flex justify-between items-center border-b pb-2">
                  <span>🌊 Altura de olas</span>
                  <span className="font-semibold text-[#0D3B66]">
                    {data[selectedSpot.name].wave_height} m
                  </span>
                </div>
              </>
            ) : (
              <p className="text-gray-500">Cargando datos...</p>
            )}
          </div>

          <div className="p-4 border-t border-gray-300">
            <button
              onClick={() => setSelectedSpot(null)}
              className="btn bg-[#0D3B66] text-white border-none hover:bg-[#124b85] w-full"
            >
              Cerrar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
