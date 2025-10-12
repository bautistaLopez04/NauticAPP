import { Link, useLocation } from "react-router-dom";
import logo from "../assets/nautic-logo.png";

export default function Navbar() {
  const location = useLocation();

  const isActive = (path: string) =>
    location.pathname === path
      ? "text-[#F5C518] font-semibold"
      : "text-white hover:text-[#F5C518] transition";

  return (
    <nav
      className="
        fixed top-0 inset-x-0 z-[1000]
        bg-[#0D3B66] text-white shadow-md h-16
        flex items-center justify-between px-8
      "
      role="navigation"
      aria-label="Nautic main"
    >
      {/* IZQUIERDA: Logo */}
      <div className="flex items-center">
        <img
          src={logo}
          alt="Nautic"
          className="h-10 w-auto object-contain"
        />
      </div>

      {/* CENTRO: menú (centrado óptico) */}
      <div className="absolute left-1/2 transform -translate-x-[45%]">
        <ul className="flex items-center gap-10 text-sm">
          <li>
            <Link to="/" className={isActive("/")}>Inicio</Link>
          </li>
          <li>
            <Link to="/map" className={isActive("/map")}>Mapa</Link>
          </li>
          <li>
            <Link to="/negocios" className={isActive("/negocios")}>Negocios</Link>
          </li>
        </ul>
      </div>

      {/* DERECHA: Botón */}
      <Link
        to="/unite"
        className="
          border border-white/80 text-white px-4 py-2 rounded-md
          text-sm font-medium hover:bg-white hover:text-[#0D3B66]
          transition-colors
        "
      >
        ¿Tenés un negocio? Unite a nosotros
      </Link>
    </nav>
  );
}
