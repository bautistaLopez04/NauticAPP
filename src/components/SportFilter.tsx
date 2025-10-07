import { useState } from "react";

export default function SportFilter({ onChange }) {
  // Guarda los deportes seleccionados
  const [selectedSports, setSelectedSports] = useState<string[]>([]);

  const toggleSport = (sport: string) => {
    // Si ya estaba seleccionado, lo saca; si no, lo agrega
    setSelectedSports((prev) => {
      const updated = prev.includes(sport)
        ? prev.filter((s) => s !== sport)
        : [...prev, sport];
      onChange(updated); // avisa al componente padre (MapView)
      return updated;
    });
  };

  const resetSports = () => {
    setSelectedSports([]);
    onChange([]);
  };

  return (
    <form className="flex gap-2 items-center">
      <input
        type="checkbox"
        className={`btn ${selectedSports.includes("surf") ? "bg-[#0D3B66] text-white" : ""}`}
        aria-label="Surf"
        onChange={() => toggleSport("surf")}
        checked={selectedSports.includes("surf")}
      />
      <input
        type="checkbox"
        className={`btn ${selectedSports.includes("kite") ? "bg-[#0D3B66] text-white" : ""}`}
        aria-label="Kite"
        onChange={() => toggleSport("kite")}
        checked={selectedSports.includes("kite")}
      />
      <input
        type="reset"
        value="×"
        className="btn btn-square"
        onClick={resetSports}
      />
    </form>
  );
}
