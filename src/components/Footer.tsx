export default function Footer() {
  return (
    <footer className="footer sm:footer-horizontal bg-[#0D3B66] text-white p-10">
      {/* Sección 1: Servicios */}
      <nav>
        <h6 className="footer-title text-[#F5C518]">Servicios</h6>
        <a className="link link-hover">Clima en tiempo real</a>
        <a className="link link-hover">Alertas personalizadas</a>
        <a className="link link-hover">Mapa interactivo</a>
        <a className="link link-hover">Directorio de escuelas</a>
      </nav>

      {/* Sección 2: Empresa */}
      <nav>
        <h6 className="footer-title text-[#F5C518]">Empresa</h6>
        <a className="link link-hover">Acerca de Nautic</a>
        <a className="link link-hover">Contacto</a>
        <a className="link link-hover">Equipo</a>
        <a className="link link-hover">Prensa</a>
      </nav>

      {/* Sección 3: Legal */}
      <nav>
        <h6 className="footer-title text-[#F5C518]">Legal</h6>
        <a className="link link-hover">Términos de uso</a>
        <a className="link link-hover">Política de privacidad</a>
        <a className="link link-hover">Política de cookies</a>
      </nav>

      {/* Sección 4: Newsletter */}
      <form>
        <h6 className="footer-title text-[#F5C518]">Newsletter</h6>
        <fieldset className="w-80">
          <label className="label-text text-white mb-2 block">
            Ingresá tu correo electrónico
          </label>
          <div className="join">
            <input
              type="email"
              placeholder="usuario@correo.com"
              className="input input-bordered join-item w-full text-black"
            />
            <button className="btn btn-primary join-item bg-[#F5C518] border-none text-[#0D3B66] hover:bg-yellow-400">
              Suscribirse
            </button>
          </div>
        </fieldset>
      </form>
    </footer>
  );
}
