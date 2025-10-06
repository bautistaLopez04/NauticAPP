import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import MapView from "./components/MapView";

function App() {
  return (
    <div className="flex flex-col h-screen">
      {/* NAVBAR fijo arriba */}
      <div className="flex-shrink-0">
        <Navbar />
      </div>

      {/* MAPA ocupa todo el espacio disponible */}
      <main className="flex-grow">
        <MapView />
      </main>

      {/* FOOTER fijo abajo */}
      <div className="flex-shrink-0">
        <Footer />
      </div>
    </div>
  );
}

export default App;

