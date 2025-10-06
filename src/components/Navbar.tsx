import Image from "next/image"; // ❌ solo si usas Next.js (en tu caso NO, estás con Vite)
import logo from "../assets/nautic-logo.png";

export default function Navbar() {
  return (
    <div className="navbar bg-[#0D3B66] text-white shadow-md px-4">
      {/* IZQUIERDA: LOGO + TEXTO */}
      <div className="navbar-start flex items-center gap-3">
        <img
          src={logo}
          alt="Nautic Logo"
          className="w-10 h-10 object-contain"
        />
        <span className="text-xl font-bold tracking-wide">Nautic</span>
      </div>

      {/* CENTRO: MENÚ */}
      <div className="navbar-center hidden md:flex">
        <ul className="menu menu-horizontal px-1">
          <li>
            <a className="hover:text-[#F5C518] transition-colors">Inicio</a>
          </li>
          <li>
            <a className="hover:text-[#F5C518] transition-colors">Mapa</a>
          </li>
          <li>
            <a className="hover:text-[#F5C518] transition-colors">Proveedores</a>
          </li>
        </ul>
      </div>

      {/* DERECHA: ÍCONOS */}
      <div className="navbar-end">
        <button className="btn btn-ghost btn-circle" aria-label="Buscar">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </button>
      </div>
    </div>
  );
}
