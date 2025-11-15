import React from "react";
import SocialHub from "../components/SocialHub";

function Redes() {
  return (
    <div className="bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <section className="relative mb-3 px-4">
        <div className="mx-auto max-w-6xl">
          <div className="relative rounded-3xl bg-blue-50 border border-blue-100 p-3 shadow-sm overflow-hidden">
            <div className="relative text-center">
              <div className="inline-flex items-center gap-2 px-2 py-1 bg-blue-50 text-blue-700 rounded-full ring-1 ring-blue-200 mb-1 font-mono">
                <span className="text-xs font-semibold">INFO-TECH</span>
              </div>
              <h1 className="text-2xl md:text-3xl font-bold mb-1 text-blue-900">Redes Sociales</h1>
              <p className="text-xs md:text-sm text-gray-700 max-w-lg mx-auto font-mono">Sigue nuestras novedades en Facebook, TikTok, WhatsApp y YouTube.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-3 px-4">
        <div className="max-w-6xl mx-auto">
          <SocialHub />
        </div>
      </section>
    </div>
  );
}

export default Redes;
