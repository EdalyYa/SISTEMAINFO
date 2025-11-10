import React from 'react';
import logo from '../logo.png';

function Footer() {
  return (
    <footer className="bg-gradient-to-b from-blue-900 via-blue-900 to-blue-950 text-white py-10 px-6 mt-12 relative overflow-hidden">
      {/* Fondo estilo informático: patrón de puntos + glow diagonal */}
      <div
        className="absolute inset-0 pointer-events-none opacity-60"
        style={{
          backgroundImage:
            'radial-gradient(rgba(255,255,255,0.45) 1px, transparent 1px), linear-gradient(135deg, rgba(0,255,255,0.45) 0%, rgba(0,0,0,0) 60%)',
          backgroundSize: '8px 8px, cover',
        }}
      />
      <div className="relative max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-5 gap-8">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <img src={logo} alt="Logo INFOUNA" className="w-24 h-24 object-contain" />
            <h3 className="font-bold text-lg">INFOUNA</h3>
          </div>
          <p className="text-sm">Instituto de Informática - Universidad Nacional del Altiplano</p>
          <p className="mt-2 text-xs">
            <a href="https://maps.google.com/?q=Edificio%20de%2015%20pisos%207mo%20piso%20-%20Ciudad%20Universitaria,%20Puno" target="_blank" rel="noopener noreferrer" className="underline hover:text-yellow-300">Edificio de 15 pisos 7mo piso - Ciudad Universitaria, Puno</a>
          </p>
          <p className="text-xs"><a href="mailto:info@infouna.edu.pe" className="underline hover:text-yellow-300">info@infouna.edu.pe</a></p>
          <p className="text-xs"><a href="tel:+51970709787" className="underline hover:text-yellow-300">(+51) 970 709 787</a></p>
          <div className="mt-3 text-xs text-blue-100">
            <p className="font-semibold">Horario de atención</p>
            <p>Lunes a Viernes · 08:00 a 18:00</p>
            <p>Atención por WhatsApp y presencial</p>
          </div>
        </div>
        <div>
          <h3 className="font-bold text-lg mb-2">Enlaces</h3>
          <nav aria-label="Enlaces del sitio">
            <ul className="space-y-2 text-sm">
              <li><a href="/" className="hover:text-yellow-400">Inicio</a></li>
              <li><a href="/nosotros" className="hover:text-yellow-400">Nosotros</a></li>
              <li><a href="/programas" className="hover:text-yellow-400">Programas</a></li>
              <li><a href="/cursos" className="hover:text-yellow-400">Cursos</a></li>
              <li><a href="/matricula" className="hover:text-yellow-400">Matrícula</a></li>
              <li><a href="/reclamaciones" className="hover:text-yellow-400">Reclamaciones</a></li>
              <li><a href="/tramites" className="hover:text-yellow-400">Trámites</a></li>
            </ul>
          </nav>
        </div>
        <div>
          <h3 className="font-bold text-lg mb-2">Atención y Trámites</h3>
          <ul className="space-y-2 text-sm" aria-label="Atención y Trámites">
            <li><a href="/matricula" className="hover:text-yellow-400">Matrícula Online</a></li>
            <li><a href="/horarios" className="hover:text-yellow-400">Horarios</a></li>
            <li><a href="/reclamaciones" className="hover:text-yellow-400">Reclamaciones</a></li>
            <li><a href="/tramites" className="hover:text-yellow-400">Trámites</a></li>
          </ul>
        </div>
        <div>
          <h3 className="font-bold text-lg mb-2">Ubicación</h3>
          <div className="rounded-lg overflow-hidden border border-blue-800">
            <iframe
              title="Ubicación INFOUNA"
              src="https://www.google.com/maps?q=Edificio%20de%2015%20pisos%207mo%20piso%20-%20Ciudad%20Universitaria,%20Puno&output=embed"
              width="100%"
              height="180"
              style={{ border: 0 }}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            ></iframe>
          </div>
        </div>
        <div>
          <h3 className="font-bold text-lg mb-2">Redes Sociales</h3>
          <p className="text-xs text-blue-100">Síguenos en nuestros canales oficiales</p>
          <div className="flex gap-3 mt-2">
            <a href="https://www.facebook.com/IIUNAP/" target="_blank" rel="noopener noreferrer" aria-label="Facebook INFOUNA" className="inline-flex items-center justify-center w-9 h-9 rounded-full bg-blue-600 text-white hover:bg-blue-700 transition">
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M22.675 0H1.325C.593 0 0 .593 0 1.326v21.348C0 23.407.593 24 1.325 24h11.494v-9.294H9.691v-3.622h3.128V8.413c0-3.1 1.893-4.788 4.659-4.788 1.325 0 2.463.099 2.795.143v3.24h-1.918c-1.504 0-1.796.715-1.796 1.765v2.314h3.59l-.467 3.622h-3.123V24h6.127C23.407 24 24 23.407 24 22.674V1.326C24 .593 23.407 0 22.675 0z" /></svg>
            </a>
            <a href="https://www.tiktok.com/@infouna" target="_blank" rel="noopener noreferrer" aria-label="TikTok INFOUNA" className="inline-flex items-center justify-center w-9 h-9 rounded-full bg-black text-white hover:bg-gray-800 transition">
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M17.5 7.5c1.5 1.1 3.3 1.8 5 1.9v3.3c-1.9-.1-3.8-.7-5.4-1.6v5.7c0 4.1-3.4 7.5-7.5 7.5S2 20.9 2 16.8s3.4-7.5 7.5-7.5c.3 0 .7 0 1 .1v3.7c-.3-.1-.6-.1-1-.1-2.1 0-3.8 1.7-3.8 3.8S7.4 20.6 9.5 20.6s3.8-1.7 3.8-3.8V2h4.2c.1 2 1.2 3.7 3 4.5z" /></svg>
            </a>
            <a href="https://api.whatsapp.com/send/?phone=51970709787&text&type=phone_number&app_absent=0" target="_blank" rel="noopener noreferrer" aria-label="WhatsApp INFOUNA" className="inline-flex items-center justify-center w-9 h-9 rounded-full bg-green-600 text-white hover:bg-green-700 transition">
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 .5A11.5 11.5 0 002.1 18.7L.5 23.5l5-1.6A11.5 11.5 0 1012 .5zm6.6 16.5c-.3.8-1.7 1.5-2.3 1.5-.6 0-1.3.2-4.5-1.4a13 13 0 01-4-3.5c-.3-.4-1-1.3-1-2.4 0-1.2.6-1.7.9-1.9.3-.2.8-.3 1-.3h.7c.2 0 .6-.1.9.7.3.8 1.1 2.7 1.2 2.9.1.2 0 .5-.3.8l-.5.6c-.1.1-.2.2 0 .5.2.3 1 1.6 2.5 2.6 1.7 1.1 3 .9 3.5.7.3-.1.6-.5.8-.8.2-.3.7-.9 1.1-.8.4.1 1.2.5 1.4.7.2.2.3.8 0 1.1z" /></svg>
            </a>
            <a href="https://www.youtube.com/@UNA_Puno" target="_blank" rel="noopener noreferrer" aria-label="YouTube INFOUNA" className="inline-flex items-center justify-center w-9 h-9 rounded-full bg-red-600 text-white hover:bg-red-700 transition">
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M23.5 6.2a3 3 0 00-2.1-2.1C19.6 3.5 12 3.5 12 3.5s-7.6 0-9.4.6A3 3 0 00.5 6.2C0 8 0 12 0 12s0 4 .5 5.8a3 3 0 002.1 2.1c1.8.6 9.4.6 9.4.6s7.6 0 9.4-.6a3 3 0 002.1-2.1C24 16 24 12 24 12s0-4-.5-5.8zM9.6 15.5v-7l6.2 3.5-6.2 3.5z" /></svg>
            </a>
          </div>
        </div>
      </div>
      <div className="text-center text-xs mt-8 text-blue-200">© {new Date().getFullYear()} INFOUNA - Universidad Nacional del Altiplano. Todos los derechos reservados.</div>
    </footer>
  );
}

export default Footer;
