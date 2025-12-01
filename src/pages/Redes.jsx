import React from "react";
import SocialHub from "../components/SocialHub";

function Redes() {
  return (
    <div className="bg-gradient-to-b from-gray-50 to-white">
      <section className="relative mb-4 md:mb-6">
        <div className="mx-auto max-w-6xl">
          <div className="relative rounded-3xl bg-blue-50 border border-blue-100 p-6 shadow-sm overflow-hidden">
            <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(59,130,246,0.12)_1px,transparent_1px),linear-gradient(to_bottom,rgba(59,130,246,0.12)_1px,transparent_1px)] [background-size:22px_22px] opacity-50 pointer-events-none"></div>
            <div className="relative text-center">
              <h1 className="text-3xl md:text-4xl font-bold mb-1 text-gray-900">Redes Sociales</h1>
              <p className="text-base md:text-xl text-gray-600 max-w-3xl mx-auto">Sigue nuestras novedades en Facebook, TikTok, WhatsApp y YouTube.</p>
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-4">
        <div className="bg-white rounded-xl shadow-sm border border-blue-100 p-5">
          <SocialHub />
        </div>
      </div>
    </div>
  );
}

export default Redes;
