import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, Thermometer, Wind, Waves, Cloud } from "lucide-react";

/* ----- SPOTS ----- */
type Sport = "surf" | "kite";
type Spot = { name: string; lat: number; lon: number; sports: Sport[] };
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

/* ----- Tipos de datos ----- */
type HourlyData = {
  time: string[];
  temperature_2m?: number[];
  wind_speed_10m?: number[];
  precipitation?: number[];
  wave_height?: number[] | null;
};
type CurrentData = {
  temperature_2m?: number;
  wind_speed_10m?: number;
  precipitation?: number;
  cloud_cover?: number;
  relative_humidity_2m?: number;
  pressure_msl?: number;
  visibility?: number;
  wave_height?: number | null;
};
type SpotData = { current: CurrentData; hourly: HourlyData | null };

/* ----- Página ----- */
export default function ForecastPage() {
  const { name = "" } = useParams();
  const spot = useMemo(
    () => SPOTS.find(s => s.name.toLowerCase() === decodeURIComponent(name).toLowerCase()),
    [name]
  );

  const [data, setData] = useState<SpotData | null>(null);

  useEffect(() => {
    if (!spot) return;
    (async () => {
      try {
        const w = await fetch(
          `https://api.open-meteo.com/v1/forecast?latitude=${spot.lat}&longitude=${spot.lon}` +
          `&current=temperature_2m,wind_speed_10m,precipitation,cloud_cover,relative_humidity_2m,pressure_msl,visibility` +
          `&hourly=temperature_2m,wind_speed_10m,precipitation,cloud_cover,relative_humidity_2m,pressure_msl,visibility` +
          `&forecast_days=1&timezone=auto`
        ).then(r => r.json());

        const m = await fetch(
          `https://marine-api.open-meteo.com/v1/marine?latitude=${spot.lat}&longitude=${spot.lon}` +
          `&hourly=wave_height&forecast_days=1&timezone=auto`
        ).then(r => r.json());

        setData({
          current: {
            temperature_2m: w?.current?.temperature_2m,
            wind_speed_10m: w?.current?.wind_speed_10m,
            precipitation: w?.current?.precipitation,
            cloud_cover: w?.current?.cloud_cover,
            relative_humidity_2m: w?.current?.relative_humidity_2m,
            pressure_msl: w?.current?.pressure_msl,
            visibility: w?.current?.visibility,
            wave_height: m?.hourly?.wave_height?.[0] ?? null,
          },
          hourly: {
            time: w?.hourly?.time ?? [],
            temperature_2m: w?.hourly?.temperature_2m ?? [],
            wind_speed_10m: w?.hourly?.wind_speed_10m ?? [],
            precipitation: w?.hourly?.precipitation ?? [],
            wave_height: m?.hourly?.wave_height ?? [],
          },
        });
      } catch {
        setData({ current: {}, hourly: null });
      }
    })();
  }, [spot]);

  if (!spot) {
    return (
      <div className="mx-auto max-w-6xl p-6">
        <Link to="/" className="inline-flex items-center gap-2 text-[#0D3B66] hover:underline">
          <ArrowLeft className="w-4 h-4" /> Volver al mapa
        </Link>
        <h1 className="mt-6 text-2xl font-semibold">Spot no encontrado</h1>
      </div>
    );
  }

  const waveStats = stats(data?.hourly?.wave_height ?? undefined);
  const windStats = stats(data?.hourly?.wind_speed_10m ?? undefined);
  const tempStats = stats(data?.hourly?.temperature_2m ?? undefined);

  return (
    <div className="bg-[#f7fafc] w-full flex-1">
      {/* HERO con gradiente */}
      <div className="border-b bg-gradient-to-b from-white to-[#f4f8fb]">
        <div className="mx-auto max-w-6xl px-5 py-4 flex items-center justify-between">
          <Link to="/" className="inline-flex items-center gap-2 text-[#0D3B66] hover:underline">
            <ArrowLeft className="w-4 h-4" /> Back to Map
          </Link>
          <div className="text-[#0D3B66] font-semibold">Nautic</div>
          <div className="flex gap-2">
            <Chip>Surf</Chip>
            <Chip>Kite</Chip>
          </div>
        </div>

        <div className="mx-auto max-w-6xl px-5 pb-6">
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-slate-900">{spot.name}</h1>
          <p className="text-sm text-slate-500 mt-1">
            {Math.abs(spot.lat).toFixed(2)}°S, {Math.abs(spot.lon).toFixed(2)}°W
          </p>

          {/* Summary */}
          <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4">
            <SummaryCard title="Condiciones actuales" value={qualifyNow(data)} color="blue" />
            <SummaryCard title="Puntuación Surf" value="7.0/10" color="teal" />
            <SummaryCard title="Puntuación Kite" value="7.5/10" color="emerald" />
            <SummaryCard title="Actualizado" value="Ahora mismo" color="slate" />
          </div>
        </div>
      </div>

      {/* CONTENIDO */}
      <div className="mx-auto max-w-6xl px-5 py-8 space-y-10">
        <SectionTitle>Condiciones Actuales</SectionTitle>
        <div className="grid md:grid-cols-3 gap-5">
          <BigCard icon={<Waves className="w-5 h-5" />} title="Dirección de Olas">
            <KV k="Height" v={fmt(data?.current?.wave_height, " m")} />
            <KV k="Period" v={data?.hourly?.time?.length ? "8s" : "—"} />
          </BigCard>
          <BigCard icon={<Wind className="w-5 h-5" />} title="Viento">
            <KV k="Speed" v={fmt(kmhNum(data?.current?.wind_speed_10m), " km/h")} />
            <KV k="Gusts" v={fmt(kmhNum(guessGust(data?.current?.wind_speed_10m)), " km/h")} />
          </BigCard>
          <BigCard icon={<Thermometer className="w-5 h-5" />} title="Clima">
            <KV k="Temperature" v={fmt(data?.current?.temperature_2m, "°C")} />
            <KV k="Precipitation" v={fmt(data?.current?.precipitation, " mm")} />
          </BigCard>
        </div>

        <SectionTitle>Detalles del Clima</SectionTitle>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <TinyStat icon={<Cloud className="w-4 h-4" />} label="Cloud Cover" value={pct(data?.current?.cloud_cover)} />
          <TinyStat icon={<Thermometer className="w-4 h-4" />} label="Humidity" value={pct(data?.current?.relative_humidity_2m)} />
          <TinyStat icon={<Waves className="w-4 h-4" />} label="Visibility" value={kmNum(data?.current?.visibility)} />
          <TinyStat icon={<Wind className="w-4 h-4" />} label="Pressure" value={hPa(data?.current?.pressure_msl)} />
        </div>

        <SectionTitle>Pronóstico 24 Horas</SectionTitle>
        <div className="grid md:grid-cols-3 gap-5">
          <StatCard
            tone="blue"
            icon={<Waves className="w-4 h-4" />}
            label="Altura de Olas"
            min={m(waveStats.min)} avg={m(waveStats.avg)} max={m(waveStats.max)}
          />
          <StatCard
            tone="emerald"
            icon={<Wind className="w-4 h-4" />}
            label="Velocidad del Viento"
            min={kmh(windStats.min)} avg={kmh(windStats.avg)} max={kmh(windStats.max)}
          />
          <StatCard
            tone="amber"
            icon={<Thermometer className="w-4 h-4" />}
            label="Temperatura"
            min={c(tempStats.min)} avg={c(tempStats.avg)} max={c(tempStats.max)}
          />
        </div>

        <SectionTitle>Mejores Horarios para Visitar</SectionTitle>
        <div className="grid md:grid-cols-2 gap-5">
          <LongCard
            icon={<Waves className="w-5 h-5" />}
            title="Mejor para Surf"
            subtitle="Sesión matutina"
            text="Condiciones óptimas esperadas entre 06:00 - 10:00 con vientos offshore y olas limpias de alrededor 1.5–2.0 m."
          />
          <LongCard
            icon={<Wind className="w-5 h-5" />}
            title="Mejor para Kite"
            subtitle="Sesión vespertina"
            text="Picos de viento previstos entre 14:00 - 18:00 con ~20 km/h desde el SE."
          />
        </div>
      </div>
    </div>
  );
}

/* ---------- UI PRIMITIVES ---------- */
function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3">
      <div className="h-[1px] w-4 bg-[#0D3B66]/40" />
      <h2 className="text-2xl font-semibold text-slate-900">{children}</h2>
      <div className="flex-1 h-[1px] bg-slate-200/70" />
    </div>
  );
}
function Chip({ children }: { children: React.ReactNode }) {
  return <span className="rounded-full border px-3 py-1 text-xs text-slate-600 bg-white shadow-sm">{children}</span>;
}
function SummaryCard({ title, value, color }: { title: string; value: string; color: "blue"|"teal"|"emerald"|"slate"; }) {
  const colorMap: Record<string, string> = {
    blue: "bg-blue-100 text-blue-700",
    teal: "bg-teal-100 text-teal-700",
    emerald: "bg-emerald-100 text-emerald-700",
    slate: "bg-slate-100 text-slate-700",
  };
  return (
    <div className="rounded-2xl border bg-white shadow-sm p-4 relative overflow-hidden">
      <div className={`absolute left-0 top-0 h-full w-1 ${color==="blue"?"bg-blue-500":color==="teal"?"bg-teal-500":color==="emerald"?"bg-emerald-500":"bg-slate-400"}`} />
      <div className="text-xs text-slate-500">{title}</div>
      <div className={`text-2xl font-bold mt-1 ${colorMap[color]}`}>{value}</div>
    </div>
  );
}
function BigCard({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border bg-white shadow-sm p-5">
      <div className="flex items-center gap-3 mb-3 text-[#0D3B66]">
        <div className="p-2 rounded-xl bg-[#0D3B66]/10">{icon}</div>
        <div className="font-semibold">{title}</div>
      </div>
      {children}
    </div>
  );
}
function KV({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex items-center justify-between text-sm text-slate-600 mt-1.5">
      <span>{k}</span>
      <span className="text-slate-900 font-semibold">{v}</span>
    </div>
  );
}
function TinyStat({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-2xl border bg-white shadow-sm p-4">
      <div className="flex items-center gap-2 text-slate-600">
        <div className="p-1.5 rounded-lg bg-slate-100">{icon}</div>
        <div className="text-sm">{label}</div>
      </div>
      <div className="text-slate-900 font-semibold mt-2">{value}</div>
    </div>
  );
}

/* StatCard */
function StatCard({
  icon, label, min, avg, max, tone = "blue",
}: {
  icon: React.ReactNode; label: string; min: string; avg: string; max: string;
  tone?: "blue" | "emerald" | "amber";
}) {
  const accent =
    tone === "emerald" ? "text-emerald-600" :
    tone === "amber"   ? "text-amber-600"   :
                         "text-blue-600";
  return (
    <div className="rounded-2xl border bg-white shadow-sm p-5 overflow-hidden">
      <div className="flex items-center gap-3 mb-3 text-[#0D3B66]">
        <div className="p-2 rounded-xl bg-[#0D3B66]/10">{icon}</div>
        <div className="font-semibold">{label}</div>
      </div>
      <div className="grid grid-cols-3 gap-3">
        <Pill label="Min"  value={min} />
        <Pill label="Prom" value={avg} accent />
        <Pill label="Máx"  value={max} />
      </div>
      <div className={`mt-3 text-sm font-semibold ${accent}`}>
        {/* detalle simple para continuidad visual */}
      </div>
    </div>
  );
}
function Pill({ label, value, accent = false }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="rounded-lg border bg-slate-50 p-3 h-[86px] flex flex-col items-center justify-center">
      <div className="text-[11px] text-slate-500">{label}</div>
      <div className={`text-[14px] font-semibold ${accent ? "text-[#0D3B66]" : "text-slate-900"} whitespace-nowrap`}>
        {value}
      </div>
    </div>
  );
}
function LongCard({
  icon,
  title,
  subtitle,
  text,
  tone = "nautic", // valor por defecto
}: {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  text: string;
  tone?: "nautic" | "emerald" | "amber" | "sky" | "slate";
}) {
  const toneText =
    tone === "emerald" ? "text-emerald-700" :
    tone === "amber"   ? "text-amber-700"   :
    tone === "sky"     ? "text-sky-700"     :
    tone === "slate"   ? "text-slate-700"   :
                         "text-[#0D3B66]";        // nautic

  const toneBg =
    tone === "emerald" ? "bg-emerald-100" :
    tone === "amber"   ? "bg-amber-100"   :
    tone === "sky"     ? "bg-sky-100"     :
    tone === "slate"   ? "bg-slate-100"   :
                         "bg-[#0D3B66]/10";       // nautic

  return (
    <div className="rounded-2xl border bg-white shadow-sm p-5">
      <div className="flex items-center gap-3">
        <div className={`${toneBg} ${toneText} p-2 rounded-xl`}>{icon}</div>
        <div>
          <div className={`${toneText} font-semibold`}>{title}</div> {/* 👈 color del título */}
          <div className="text-xs text-slate-500">{subtitle}</div>
        </div>
      </div>
      <p className="text-sm text-slate-700 mt-3">{text}</p>
    </div>
  );
}


/* ---------- utils ---------- */
function stats(arr?: number[]) {
  if (!arr?.length) return { min: NaN, avg: NaN, max: NaN };
  const min = Math.min(...arr);
  const max = Math.max(...arr);
  const avg = arr.reduce((a, b) => a + b, 0) / arr.length;
  return { min, avg, max };
}
const fmt = (v?: number | null, unit = "", map: (n: number) => number = (n) => n) =>
  v == null || Number.isNaN(v) ? "—" : `${map(v).toFixed(1)}${unit}`;
const m = (n: number) => `${n.toFixed(1)} m`;
const c = (n: number) => `${n.toFixed(1)}°C`;
const kmh = (n: number) => `${(n * 3.6).toFixed(1)} km/h`;
const kmhNum = (n?: number | null) => (n == null || Number.isNaN(n)) ? NaN : n * 3.6;
const kmNum = (n?: number) => (n == null || Number.isNaN(n)) ? "—" : `${(n / 1000).toFixed(0)}km`;
const hPa = (n?: number) => (n == null || Number.isNaN(n)) ? "—" : `${n.toFixed(0)}hPa`;
const pct = (n?: number) => (n == null || Number.isNaN(n)) ? "—" : `${n.toFixed(0)}%`;
function guessGust(speed?: number) {
  if (speed == null || Number.isNaN(speed)) return NaN;
  return speed * 1.3;
}
function qualifyNow(d: SpotData | null): string {
  if (!d?.current) return "—";
  const h = d.current.wave_height ?? 0;
  const w = d.current.wind_speed_10m ?? 0;
  if (h >= 1.2 && w < 8) return "Bueno";
  if (h >= 0.7) return "Aceptable";
  return "Calmo";
}
