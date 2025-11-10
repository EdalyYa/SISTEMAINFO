import React from "react";
import SocialHub from "../components/SocialHub";

function Redes() {
  return (
    <div className="bg-gray-50">
      {/* Encabezado de la sección */}
      <section className="bg-gradient-to-r from-blue-900 to-indigo-700 text-white py-10 px-6">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl md:text-4xl font-bold">Redes Sociales</h1>
          <p className="mt-2 text-sm md:text-base text-blue-100">
            Sigue nuestras novedades en Facebook, TikTok, WhatsApp y YouTube.
          </p>
        </div>
      </section>

      {/* Contenido: tarjetas/embeds del SocialHub */}
      <section className="py-8 md:py-12 px-4 md:px-6">
        <div className="max-w-7xl mx-auto">
          <SocialHub />
        </div>
      </section>
    </div>
  );
}

export default Redes;

