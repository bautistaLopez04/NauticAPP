import { useState } from "react";

type Props = { onChange: (sports: string[]) => void };

export default function SportFilter({ onChange }: Props) {
  const [selectedSports, setSelectedSports] = useState<string[]>([]);

  const toggleSport = (sport: string) => {
    setSelectedSports((prev) => {
      const updated = prev.includes(sport)
        ? prev.filter((s) => s !== sport)
        : [...prev, sport];
      onChange(updated);
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
