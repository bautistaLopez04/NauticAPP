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
          <li><a className="hover:text-[#F5C518] transition-colors" href="#">Proveedores</a></li>
        </ul>

        {/* DERECHA: búsqueda */}
        <button
          className="inline-flex items-center justify-center w-10 h-10 rounded-full hover:bg-white/10"
          aria-label="Buscar"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5"
               fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </button>
      </div>
    </nav>
  );
}

