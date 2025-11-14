import React from "react";

const LINKS = {
  facebook: "https://www.facebook.com/IIUNAP/",
  tiktok: "https://www.tiktok.com/@infouna",
  // Usamos el handle proporcionado por el usuario y sincronizado con el Footer
  youtube: "https://www.youtube.com/@UNA_Puno",
  whatsapp: "https://api.whatsapp.com/send/?phone=51970709787&text&type=phone_number&app_absent=0",
};

function Icon({ name, className = "w-6 h-6" }) {
  switch (name) {
    case "facebook":
      return (
        <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M22.675 0H1.325C.593 0 0 .593 0 1.326v21.348C0 23.407.593 24 1.325 24h11.494v-9.294H9.691v-3.622h3.128V8.413c0-3.1 1.893-4.788 4.659-4.788 1.325 0 2.463.099 2.795.143v3.24h-1.918c-1.504 0-1.796.715-1.796 1.765v2.314h3.59l-.467 3.622h-3.123V24h6.127C23.407 24 24 23.407 24 22.674V1.326C24 .593 23.407 0 22.675 0z" />
        </svg>
      );
    case "tiktok":
      return (
        <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M17.5 7.5c1.5 1.1 3.3 1.8 5 1.9v3.3c-1.9-.1-3.8-.7-5.4-1.6v5.7c0 4.1-3.4 7.5-7.5 7.5S2 20.9 2 16.8s3.4-7.5 7.5-7.5c.3 0 .7 0 1 .1v3.7c-.3-.1-.6-.1-1-.1-2.1 0-3.8 1.7-3.8 3.8S7.4 20.6 9.5 20.6s3.8-1.7 3.8-3.8V2h4.2c.1 2 1.2 3.7 3 4.5z" />
        </svg>
      );
    case "youtube":
      return (
        <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M23.5 6.2a3 3 0 00-2.1-2.1C19.6 3.5 12 3.5 12 3.5s-7.6 0-9.4.6A3 3 0 00.5 6.2C0 8 0 12 0 12s0 4 .5 5.8a3 3 0 002.1 2.1c1.8.6 9.4.6 9.4.6s7.6 0 9.4-.6a3 3 0 002.1-2.1C24 16 24 12 24 12s0-4-.5-5.8zM9.6 15.5v-7l6.2 3.5-6.2 3.5z" />
        </svg>
      );
    case "whatsapp":
      return (
        <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M12 .5A11.5 11.5 0 002.1 18.7L.5 23.5l5-1.6A11.5 11.5 0 1012 .5zm6.6 16.5c-.3.8-1.7 1.5-2.3 1.5-.6 0-1.3.2-4.5-1.4a13 13 0 01-4-3.5c-.3-.4-1-1.3-1-2.4 0-1.2.6-1.7.9-1.9.3-.2.8-.3 1-.3h.7c.2 0 .6-.1.9.7.3.8 1.1 2.7 1.2 2.9.1.2 0 .5-.3.8l-.5.6c-.1.1-.2.2 0 .5.2.3 1 1.6 2.5 2.6 1.7 1.1 3 .9 3.5.7.3-.1.6-.5.8-.8.2-.3.7-.9 1.1-.8.4.1 1.2.5 1.4.7.2.2.3.8 0 1.1z" />
        </svg>
      );
    default:
      return null;
  }
}

export default function SocialHub() {
  const pageUrl = encodeURIComponent(LINKS.facebook);
  const fbPluginUrl = `https://www.facebook.com/plugins/page.php?href=${pageUrl}&tabs=timeline&width=500&height=400&small_header=false&adapt_container_width=true&hide_cover=false&show_facepile=true`;

  // Cargar script de TikTok de forma diferida cuando el bloque entra en vista
  const [ttInitKey, setTtInitKey] = React.useState(0);
  const [ttReady, setTtReady] = React.useState(false);
  const [ttError, setTtError] = React.useState(false);
  const [ttShouldLoad, setTtShouldLoad] = React.useState(false);
  const ttContainerRef = React.useRef(null);

  // Observer para detectar visibilidad del bloque de TikTok
  React.useEffect(() => {
    const el = ttContainerRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.some((e) => e.isIntersecting);
        if (visible) {
          setTtShouldLoad(true);
        }
      },
      { root: null, rootMargin: '50px', threshold: 0.1 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  React.useEffect(() => {
    setTtShouldLoad(true);
  }, []);

  // Inyectar el script de TikTok sólo cuando sea necesario
  React.useEffect(() => {
    if (!ttShouldLoad) return;
    const existing = document.querySelector('script[src="https://www.tiktok.com/embed.js"]');
    if (!existing) {
      const s = document.createElement('script');
      s.src = 'https://www.tiktok.com/embed.js';
      s.async = true;
      s.onload = () => {
        setTimeout(() => setTtInitKey((k) => k + 1), 300);
      };
      s.onerror = () => {
        setTtError(true);
      };
      document.body.appendChild(s);
    } else {
      // Fuerza re-procesamiento si el script ya existía
      const timer = setTimeout(() => setTtInitKey((k) => k + 1), 600);
      return () => clearTimeout(timer);
    }
  }, [ttShouldLoad]);

  // Detectar si el embed renderizó; si no, mostrar fallback
  React.useEffect(() => {
    const check = () => {
      const el = ttContainerRef.current;
      if (!el) return;
      const hasContent = el.querySelector('.tiktok-embed')?.nextElementSibling || el.querySelector('iframe');
      const h = el.offsetHeight;
      if (hasContent && h > 100) {
        setTtReady(true);
        setTtError(false);
      } else {
        setTtReady(false);
        setTtError(true);
      }
    };
    const t1 = setTimeout(check, 1200);
    const t2 = setTimeout(check, 3500);
    const t3 = setTimeout(check, 6000);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, [ttInitKey]);

  // YouTube: configurable vía .env para evitar llamadas externas y errores CORS
  const YT_CHANNEL_ID = import.meta.env.VITE_YOUTUBE_CHANNEL_ID; // UC...
  const YT_PLAYLIST_ID = import.meta.env.VITE_YOUTUBE_PLAYLIST_ID; // PL... o UU...
  const ytEmbedUrl = (() => {
    if (YT_PLAYLIST_ID) {
      return `https://www.youtube.com/embed/videoseries?list=${YT_PLAYLIST_ID}`;
    }
    if (YT_CHANNEL_ID && String(YT_CHANNEL_ID).startsWith('UC')) {
      const uploadsId = 'UU' + String(YT_CHANNEL_ID).slice(2);
      return `https://www.youtube.com/embed/videoseries?list=${uploadsId}`;
    }
    return null;
  })();

  // QR de WhatsApp como tarjeta de contacto
  const waQrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(LINKS.whatsapp)}`;

  return (
    <section className="bg-white py-10 px-6">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-2xl font-bold text-blue-900 mb-2 text-center">Redes Sociales</h2>
        <p className="text-gray-600 text-sm mb-6 text-center">Síguenos para noticias, cursos y eventos del Instituto de Informática INFOUNA.</p>
        <div className="flex gap-3 mb-8 justify-center">
          <a href={LINKS.facebook} target="_blank" rel="noreferrer" aria-label="Facebook INFOUNA" className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-blue-600 text-white hover:bg-blue-700 transition">
            <Icon name="facebook" />
          </a>
          <a href={LINKS.tiktok} target="_blank" rel="noreferrer" aria-label="TikTok INFOUNA" className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-black text-white hover:bg-gray-800 transition">
            <Icon name="tiktok" />
          </a>
          <a href={LINKS.youtube} target="_blank" rel="noreferrer" aria-label="YouTube INFOUNA" className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-red-600 text-white hover:bg-red-700 transition">
            <Icon name="youtube" />
          </a>
          <a href={LINKS.whatsapp} target="_blank" rel="noreferrer" aria-label="WhatsApp INFOUNA" className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-green-600 text-white hover:bg-green-700 transition">
            <Icon name="whatsapp" />
          </a>
        </div>

        {/* Grid de previews (Facebook, YouTube, TikTok, WhatsApp) */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
          {/* Facebook */}
          <div className="rounded-xl overflow-hidden shadow-lg border border-blue-100">
            <iframe
              title="Facebook Page Plugin INFOUNA"
              src={fbPluginUrl}
              width="100%"
              height="400"
              style={{ border: 'none', overflow: 'hidden' }}
              scrolling="no"
              frameBorder="0"
              allow="encrypted-media; clipboard-write; picture-in-picture; web-share"
              loading="lazy"
            ></iframe>
          </div>

          {/* YouTube (playlist de uploads del canal) */}
          <div className="rounded-xl overflow-hidden shadow-lg border border-blue-100">
            {ytEmbedUrl ? (
              <iframe
                title="YouTube Canal Preview"
                src={ytEmbedUrl}
                width="100%"
                height="400"
                style={{ border: 'none' }}
                loading="lazy"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
              ></iframe>
            ) : (
              <div className="h-[400px] flex flex-col items-center justify-center bg-white">
                <Icon name="youtube" className="w-10 h-10 text-red-600" />
                <p className="mt-2 text-gray-600 text-sm">No se pudo cargar la vista previa del canal.</p>
                <a
                  href={LINKS.youtube}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-3 inline-flex items-center px-3 py-2 bg-red-600 text-white rounded-lg shadow hover:bg-red-700"
                >
                  Abrir canal en YouTube
                </a>
              </div>
            )}
          </div>

          {/* TikTok perfil */}
          <div ref={ttContainerRef} className="rounded-xl overflow-hidden shadow-lg border border-blue-100 p-2 min-h-[400px]">
            {!ttError && (
              <blockquote
                className="tiktok-embed"
                cite="https://www.tiktok.com/@infouna"
                data-unique-id="infouna"
                data-embed-type="creator"
                data-lang="es-ES"
                style={{ maxWidth: '720px', minWidth: '288px' }}
                key={ttInitKey}
              >
                <section>
                  <a target="_blank" rel="noreferrer" href="https://www.tiktok.com/@infouna?refer=creator_embed">@infouna</a>
                </section>
              </blockquote>
            )}
            {ttError && (
              <div className="p-4">
                <p className="text-sm text-gray-600">No se pudo cargar la vista previa de TikTok.</p>
                <a href={LINKS.tiktok} target="_blank" rel="noreferrer" className="mt-2 inline-flex items-center px-3 py-2 bg-black text-white rounded-lg">Abrir perfil en TikTok</a>
              </div>
            )}
            {/* Fallback si el script de TikTok está bloqueado */}
            <noscript>
              <div className="p-4">
                <p className="text-sm text-gray-600">No se pudo cargar la vista previa de TikTok.</p>
                <a href={LINKS.tiktok} target="_blank" rel="noreferrer" className="mt-2 inline-flex items-center px-3 py-2 bg-black text-white rounded-lg">Abrir perfil en TikTok</a>
              </div>
            </noscript>
          </div>

          {/* WhatsApp (CTA + QR) */}
          <div className="rounded-xl overflow-hidden shadow-lg border border-blue-100 p-4 bg-green-50">
            <h3 className="text-green-800 font-semibold mb-2">WhatsApp INFOUNA</h3>
            <p className="text-sm text-green-700 mb-3">Escríbenos para consultas de matrícula y cursos.</p>
            <a href={LINKS.whatsapp} target="_blank" rel="noreferrer" className="inline-flex items-center px-3 py-2 bg-green-600 text-white rounded-lg shadow hover:bg-green-700">
              <span className="mr-2">Abrir WhatsApp</span>
            </a>
            <div className="mt-4 flex items-center gap-3">
              <img src={waQrUrl} alt="QR WhatsApp INFOUNA" className="w-24 h-24 border border-green-200 rounded" />
              <div className="text-xs text-green-700">Escanea el QR o usa el botón para iniciar chat.</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
