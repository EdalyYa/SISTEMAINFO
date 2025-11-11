import React, { useState, useEffect } from "react";
import { Routes, Route, Navigate } from 'react-router-dom';
import HomePage from "./pages/HomePage";
import BlogNoticiasPage from "./pages/BlogNoticias";
import FAQPage from "./pages/FAQ";
import CalendarioPage from "./pages/Calendario";
import DescargablesPage from "./pages/Descargables";
import DocumentosPage from "./pages/Documentos";
import CourseDetails from "./pages/CourseDetails";
import Nosotros from "./pages/Nosotros";
import MisionVision from "./pages/MisionVision";
import Equipo from "./pages/Equipo";
import Historia from "./pages/Historia";
import Layout from "./Layout";
import Horarios from "./pages/Horarios";
import Programas from "./pages/Programas";
import Cursos from "./pages/Cursos";
import CursosLibres from "./pages/CursosLibres";
import Matricula from "./pages/Matricula";
import Reclamaciones from "./pages/Reclamaciones";
import Tramites from "./pages/Tramites";
import Redes from "./pages/Redes";
import AdminApp from "./AdminApp";
import PromoModal from "./components/PromoModal";
import Modulos from "./pages/Modulos.jsx";
import CursosDeModulo from "./pages/CursosDeModulo.jsx";
import DescargaCertificado from "./pages/DescargaCertificado.jsx";
import InstitucionalTransparencia from "./pages/InstitucionalTransparencia";
import InstitucionalAcreditacion from "./pages/InstitucionalAcreditacion";
import InstitucionalPoliticas from "./pages/InstitucionalPoliticas";

function App() {
  const [showPromoModal, setShowPromoModal] = useState(false);

  // El portal público no requiere sesión de usuario; dejamos solo lógica del modal.

  // Mostrar modal promocional solo al refrescar el navegador
  useEffect(() => {
    // Mostrar el modal SIEMPRE al entrar a la página (sin session gating)
    const timer = setTimeout(() => {
      setShowPromoModal(true);
    }, 1200);
    return () => clearTimeout(timer);
  }, []);

  const handleClosePromoModal = () => {
    setShowPromoModal(false);
  };

  return (
    <Routes>
      {/* Rutas del panel administrativo - completamente separadas (evitar conflicto con proxy /admin) */}
      <Route path="/panel/*" element={<AdminApp />} />
      {/* Compatibilidad: redirigir /admin (y subrutas) al login del panel */}
      <Route path="/admin" element={<Navigate to="/panel/login" replace />} />
      <Route path="/admin/*" element={<Navigate to="/panel/login" replace />} />
      
      {/* Rutas del sitio web principal */}
      <Route path="/*" element={
        <>
          <Layout>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/detalles/:id" element={<CourseDetails />} />
              <Route path="/nosotros" element={<Nosotros />} />
              <Route path="/nosotros/mision-vision" element={<MisionVision />} />
              <Route path="/nosotros/equipo" element={<Equipo />} />
              <Route path="/nosotros/historia" element={<Historia />} />
              <Route path="/horarios" element={<Horarios />} />
              <Route path="/noticias" element={<BlogNoticiasPage />} />
              <Route path="/blog" element={<BlogNoticiasPage />} />
              <Route path="/faq" element={<FAQPage />} />
              <Route path="/calendario" element={<CalendarioPage />} />
              <Route path="/descargables" element={<DescargablesPage />} />
              <Route path="/documentos" element={<DocumentosPage />} />
              <Route path="/institucional/transparencia" element={<InstitucionalTransparencia />} />
              <Route path="/institucional/acreditacion" element={<InstitucionalAcreditacion />} />
              <Route path="/institucional/politicas" element={<InstitucionalPoliticas />} />
              <Route path="/programas" element={<Programas />} />
              <Route path="/cursos" element={<Cursos />} />
              <Route path="/cursos-libres" element={<CursosLibres />} />
              <Route path="/programas/:programaId" element={<Modulos />} />
              <Route
                path="/programas/:programaId/modulos/:moduloId"
                element={<CursosDeModulo />}
              />
              {/* Verificación/descarga pública de certificados */}
              <Route path="/certificados" element={<DescargaCertificado />} />
              {/* Quitamos el acceso directo para evitar romper el orden */}
              {/* <Route path="/modulos" element={<Modulos />} /> */}
              <Route path="/matricula" element={<Matricula />} />
              <Route path="/reclamaciones" element={<Reclamaciones />} />
              <Route path="/tramites" element={<Tramites />} />
              <Route path="/redes" element={<Redes />} />
              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          </Layout>
          
          {/* Modal promocional */}
          <PromoModal 
            isOpen={showPromoModal} 
            onClose={handleClosePromoModal}
          />
        </>
      } />
    </Routes>
  );
}

export default App;
