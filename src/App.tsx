import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import MapView from "./components/MapView";
import ForecastPage from "./components/ForecastPage";

export default function App() {
  return (
    <BrowserRouter>
      <div className="flex min-h-screen flex-col bg-[#f7fafc]">
        {/* 🔹 NAVBAR FIJO ARRIBA */}
        <Navbar />

        {/* 🔹 CONTENIDO PRINCIPAL (espaciado para el navbar fijo) */}
        <main className="flex-1 flex mt-16"> {/* mt-16 = 64px de alto del navbar */}
          <Routes>
            <Route path="/" element={<MapView />} />
            <Route path="/forecast/:name" element={<ForecastPage />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

