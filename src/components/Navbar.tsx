import Image from "next/image"; // ❌ solo si usas Next.js (en tu caso NO, estás con Vite)
import logo from "../assets/nautic-logo.png";

export default function Navbar() {
  return (
    <nav
      className="
        fixed top-0 inset-x-0 z-[1000]
        bg-[#0D3B66]/95 backdrop-blur
        text-white shadow-md
        h-16
      "
      role="navigation"
      aria-label="Nautic main"
    >
      <div className="mx-auto h-full max-w-7xl px-4 flex items-center justify-between">
        {/* IZQUIERDA: Logo + brand */}
        <div className="flex items-center gap-3">
          <img src={logo} alt="Nautic" className="w-9 h-9 object-contain" />
          <span className="text-lg font-bold tracking-wide">Nautic</span>
        </div>

        {/* CENTRO: menú */}
        <ul className="hidden md:flex items-center gap-6 text-sm">
          <li><a className="hover:text-[#F5C518] transition-colors" href="#">Inicio</a></li>
          <li><a className="hover:text-[#F5C518] transition-colors" href="#">Mapa</a></li>
          <li><a className="hover:text-[#F5C518] transition-colors" href="#">Negocios</a></li>
        </ul>
      </div>
    </nav>
  );
}

