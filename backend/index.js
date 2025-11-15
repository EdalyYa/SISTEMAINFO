const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const path = require('path');
const multer = require('multer');
const fs = require('fs');
// Rutas V1 de certificados desactivadas
const programasRoutes = require('./programas');
const horariosRoutes = require('./routes/horarios');
const cursosLibresRoutes = require('./routes/cursosLibres');
const modalPromocionalRoutes = require('./routes/modalPromocional');
const documentosRoutes = require('./routes/documentos');
const certificadosV2Routes = require('./routes/certificadosV2');
const adminCertificadosRoutes = require('./routes/adminCertificados');
const cifrasLogrosRoutes = require('./routes/cifrasLogros');
const configuracionRoutes = require('./configuracion');
const enrollmentVideosRoutes = require('./routes/enrollmentVideos');
const videosInformativosRoutes = require('./videos_informativos');
const errorHandler = require('./middleware/errorHandler'); // 1. Importar el manejador de errores

// top-level: configuración de CORS
const app = express();
const port = Number(process.env.PORT) || 4001;

// Middleware
const devOrigins = [
  'http://localhost:5173', 'http://localhost:5174', 'http://localhost:5175', 'http://localhost:5176', 'http://localhost:5177', 'http://localhost:5181', 'http://localhost:5182',
  'http://127.0.0.1:5173', 'http://127.0.0.1:5174', 'http://127.0.0.1:5175', 'http://127.0.0.1:5176', 'http://127.0.0.1:5177', 'http://127.0.0.1:5181', 'http://127.0.0.1:5182'
];
const envOrigins = (process.env.CORS_ORIGINS || '').split(',').map(s => s.trim()).filter(Boolean);
const allowedOrigins = [...devOrigins, ...envOrigins];

// CORS: por simplicidad, reflejar cualquier origen (incluye Vercel y previsualizaciones)
app.use(cors({
  origin: (origin, callback) => callback(null, true),
  credentials: true,
}));
app.use(express.json());

// Ruta raíz y health-check para Render
app.get('/', (req, res) => {
  res.type('text').send('INFOUNA API • OK');
});
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Redirección directa: cuando el frontend solicita /admin (por proxy),
// responder con 302 hacia el login del panel en el sitio público.
// Esto evita el "Cannot GET /admin" y mantiene el acceso en /panel/login.
app.get('/admin', (req, res) => {
  // Redirección relativa; el navegador aplicará el cambio sobre el origen de Vite (5173)
  // al estar detrás del proxy. Si prefieres absoluto, usa:
  // res.redirect(302, 'http://localhost:5173/panel/login');
  res.redirect(302, '/panel/login');
});

app.use('/api/enrollment-videos', enrollmentVideosRoutes);
app.use('/api', videosInformativosRoutes);
app.use(express.json());

// Servir archivos estáticos para las imágenes subidas
// Algunos módulos guardan en backend/uploads y otros en ../uploads (raíz del repo).
// Para compatibilidad en producción, exponemos ambos bajo el mismo prefijo.
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

// Compatibilidad: servir activos del frontend referenciados como rutas absolutas
// Algunos registros en BD pueden apuntar a '/src/Imagenes/...'; exponemos esa carpeta
// del frontend a través del backend para evitar 404 en producción.
app.use('/src/Imagenes', express.static(path.join(__dirname, '..', 'src', 'Imagenes')));

// Soporte de proveedor de almacenamiento: local (uploads/) o Supabase Storage
const STORAGE_PROVIDER = (process.env.STORAGE_PROVIDER || 'local').toLowerCase();
const { getSupabase } = require('./services/supabase');

// Configuración de subida de imágenes para cursos
function makeCursoMulter() {
  if (STORAGE_PROVIDER === 'supabase' && getSupabase()) {
    return multer({
      storage: multer.memoryStorage(),
      limits: { fileSize: 5 * 1024 * 1024 },
      fileFilter: (req, file, cb) => {
        if (file.mimetype && file.mimetype.startsWith('image/')) cb(null, true);
        else cb(new Error('Solo se permiten archivos de imagen'));
      }
    });
  }
  const cursosStorage = multer.diskStorage({
    destination: function (req, file, cb) {
      const uploadPath = path.join(__dirname, 'uploads', 'cursos');
      if (!fs.existsSync(uploadPath)) {
        fs.mkdirSync(uploadPath, { recursive: true });
      }
      cb(null, uploadPath);
    },
    filename: function (req, file, cb) {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
      cb(null, 'curso-' + uniqueSuffix + path.extname(file.originalname));
    }
  });
  return multer({
    storage: cursosStorage,
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
      if (file.mimetype && file.mimetype.startsWith('image/')) cb(null, true);
      else cb(new Error('Solo se permiten archivos de imagen'));
    }
  });
}
const uploadCursoImagen = makeCursoMulter();

// Pool de base de datos unificado (soporta SSL y DB_DISABLE)
// Usa backend/config/database.js para centralizar configuración y compatibilidad con Render
const { pool } = require('./config/database');

const { JWT_SECRET } = require('./config/secrets');

async function ensureSecureUserSchema() {
  try {
    const [columns] = await pool.query('SHOW COLUMNS FROM users');
    const names = Array.isArray(columns) ? columns.map(c => c.Field) : [];
    if (names.includes('password')) {
      console.error('Esquema inseguro: columna legacy users.password detectada');
      throw new Error('Elimina users.password y usa users.password_hash');
    }
    if (!names.includes('password_hash')) {
      throw new Error('Esquema inválido: falta users.password_hash');
    }
  } catch (err) {
    console.error('Fallo verificación de esquema de usuarios:', err.message || err);
    throw err;
  }
}

ensureSecureUserSchema().catch(() => process.exit(1));

// Mount auth module router under /api/auth
const authModule = require('./auth')(pool);
app.use('/api/auth', authModule.router);
app.use('/auth', authModule.router); // alias temporal de compatibilidad

// Authentication middleware
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) {
    return res.status(401).json({ error: 'No autorizado', message: 'Falta token' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Token inválido', message: 'No autorizado' });
    }
    req.user = user;
    next();
  });
}

// Routes

// Certificados V1 desactivados en favor de V2 (rutas anteriores removidas)

// Use programas routes
app.use('/admin/programas', programasRoutes(pool, { authenticateToken }));

// Use horarios routes
app.use('/api/horarios', horariosRoutes(pool, { authenticateToken }));

// Use cursos libres routes
app.use('/api/cursos-libres', cursosLibresRoutes(pool, { authenticateToken }));

// Public courses catalog endpoint (no auth)
// Returns courses with program information, only active ones if estado provided
app.get('/api/cursos', async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT 
        c.*, 
        p.id as programa_id, 
        p.nombre as programa_nombre
      FROM cursos c
      LEFT JOIN programas p ON p.id = c.programa_id
      WHERE COALESCE(c.estado, 'activo') = 'activo'
      ORDER BY c.id DESC
    `);
    res.json(rows);
  } catch (error) {
    console.error('Error fetching public cursos:', error);
    res.status(500).json({ error: 'Error interno al obtener cursos' });
  }
});

app.get('/api/social/tiktok/latest/:handle', async (req, res) => {
  try {
    const handle = String(req.params.handle || '').replace(/^@/, '');
    if (!handle) return res.status(400).json({ error: 'Handle requerido' });
    const target = `https://www.tiktok.com/@${handle}`;
    const resp = await fetch(target, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'es-ES,es;q=0.9,en-US;q=0.8,en;q=0.7',
        'Referer': 'https://www.tiktok.com/'
      }
    });
    if (!resp.ok) {
      return res.json({ id: null, url: `https://www.tiktok.com/@${handle}`, cover: null, profile: true });
    }
    const html = await resp.text();
    const mSigi = html.match(/<script id="SIGI_STATE"[^>]*>([\s\S]*?)<\/script>/);
    const mNext = html.match(/<script[^>]*id="__NEXT_DATA__"[^>]*>([\s\S]*?)<\/script>/);
    const mOgImg = html.match(/<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["'][^>]*>/i);
    const mOgImgSecure = html.match(/<meta[^>]+property=["']og:image:secure_url["'][^>]+content=["']([^"']+)["'][^>]*>/i);
    const mTwitterImg = html.match(/<meta[^>]+name=["']twitter:image["'][^>]+content=["']([^"']+)["'][^>]*>/i);
    const metaCover = (mOgImg && mOgImg[1]) || (mOgImgSecure && mOgImgSecure[1]) || (mTwitterImg && mTwitterImg[1]) || null;
    let data = null;
    try { data = mSigi ? JSON.parse(mSigi[1]) : null; } catch(_) {}
    if (!data) {
      try { data = mNext ? JSON.parse(mNext[1]) : null; } catch(_) {}
    }
    const collectVideos = (obj, acc=[]) => {
      try {
        if (!obj || typeof obj !== 'object') return acc;
        if (obj.id && obj.video) acc.push(obj);
        for (const k of Object.keys(obj)) {
          const v = obj[k];
          if (v && typeof v === 'object') collectVideos(v, acc);
        }
        return acc;
      } catch(_) { return acc; }
    };
    let videos = [];
    if (data && data.ItemModule) {
      videos = Object.values(data.ItemModule || {});
    } else if (data) {
      videos = collectVideos(data, []);
    }
    videos = Array.isArray(videos) ? videos : [];
    if (!videos.length) {
      return res.json({ id: null, url: `https://www.tiktok.com/@${handle}`, cover: null, profile: true });
    }
    videos.sort((a,b)=> Number(b.createTime||0) - Number(a.createTime||0));
    const v = videos[0];
    const vid = String(v.id || v.id_str || '').trim();
    const cover = (v && v.video && (v.video.originCover || v.video.cover || v.video.dynamicCover)) || metaCover || null;
    if (!vid) {
      return res.json({ id: null, url: `https://www.tiktok.com/@${handle}`, cover, profile: true });
    }
    return res.json({ id: vid, url: `https://www.tiktok.com/@${handle}/video/${vid}`, cover });
  } catch (e) {
    console.error('TikTok latest error:', e && e.message ? e.message : e);
    return res.json({ id: null, url: `https://www.tiktok.com/@${String(req.params.handle||'').replace(/^@/,'')}`, cover: null, profile: true });
  }
});

// Use modal promocional routes
app.use('/api/modal-promocional', modalPromocionalRoutes(pool, { authenticateToken }));

// Use cifras logros routes
app.use('/api/cifras-logros', cifrasLogrosRoutes);

// Use configuración routes (general system settings)
app.use('/api/configuracion', configuracionRoutes(pool, { authenticateToken }));

// Biblioteca de documentos (público y admin)
app.use('/api/documentos', documentosRoutes(pool, { authenticateToken }));
app.use('/api/certificados-v2', certificadosV2Routes);
app.use('/api/admin/certificados', adminCertificadosRoutes);
app.use('/admin/certificados', adminCertificadosRoutes);

// Noticias tecnológicas: proxy/normalización desde NewsAPI
// Usa la variable de entorno NEWS_API_KEY para autenticación.
const https = require('https');

function fetchJSON(url, headers = {}) {
  return new Promise((resolve, reject) => {
    const req = https.get(url, { headers }, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          resolve(json);
        } catch (e) {
          reject(e);
        }
      });
    });
    req.on('error', reject);
    req.end();
  });
}

function getCategoryKeywords(category) {
  const categoryKeywords = {
    programming: ['javascript', 'python', 'java', 'react', 'programming', 'coding'],
    ai_ml: ['artificial intelligence', 'machine learning', 'AI', 'ML', 'deep learning'],
    cybersecurity: ['cybersecurity', 'security', 'hacking', 'encryption'],
    cloud: ['cloud computing', 'AWS', 'Azure', 'Google Cloud'],
    data_analysis: ['data analysis', 'big data', 'analytics', 'data science'],
    design: ['UI/UX', 'design', 'photoshop', 'graphic design'],
  };
  return categoryKeywords[category] || [];
}

function categorizeNews(article) {
  const content = `${article.title || ''} ${article.description || ''}`.toLowerCase();
  const categories = {
    programming: ['javascript', 'python', 'java', 'react', 'node', 'programming', 'coding', 'software development', 'web development'],
    ai_ml: ['artificial intelligence', 'machine learning', 'ai', 'ml', 'deep learning', 'neural network', 'chatgpt', 'openai'],
    cybersecurity: ['cybersecurity', 'security', 'hacking', 'breach', 'encryption', 'privacy', 'malware', 'ransomware'],
    cloud: ['cloud computing', 'aws', 'azure', 'google cloud', 'serverless', 'containers', 'kubernetes', 'docker'],
    data_analysis: ['data analysis', 'big data', 'analytics', 'business intelligence', 'data science', 'visualization'],
    design: ['ui/ux', 'design', 'photoshop', 'illustrator', 'graphic design', 'web design', 'user experience'],
  };
  for (const [category, keywords] of Object.entries(categories)) {
    if (keywords.some((k) => content.includes(k))) return category;
  }
  return 'programming';
}

function findRelatedCourses(article) {
  const content = `${article.title || ''} ${article.description || ''}`.toLowerCase();
  const courseKeywords = {
    'Programación Python básico': ['python', 'programming', 'coding'],
    'Programación JavaScript': ['javascript', 'js', 'web development'],
    'React.js': ['react', 'reactjs', 'frontend'],
    'Machine Learning': ['machine learning', 'ml', 'ai', 'artificial intelligence'],
    'Cyberseguridad': ['cybersecurity', 'security', 'hacking'],
    'AWS Cloud': ['aws', 'cloud computing', 'amazon web services'],
    'Power BI': ['power bi', 'business intelligence', 'data visualization'],
    'Adobe Photoshop': ['photoshop', 'image editing', 'graphic design'],
  };
  const related = [];
  for (const [course, keywords] of Object.entries(courseKeywords)) {
    if (keywords.some((k) => content.includes(k))) related.push(course);
  }
  return related.slice(0, 3);
}

function calculateRelevance(article) {
  const content = `${article.title || ''} ${article.description || ''}`.toLowerCase();
  let score = 0;
  const high = ['programming', 'technology', 'software', 'development', 'ai', 'machine learning'];
  const medium = ['digital', 'innovation', 'tech', 'computer', 'data'];
  high.forEach((k) => content.includes(k) && (score += 3));
  medium.forEach((k) => content.includes(k) && (score += 1));
  const publishedDate = new Date(article.publishedAt);
  const daysDiff = (Date.now() - publishedDate.getTime()) / (1000 * 60 * 60 * 24);
  if (!isNaN(daysDiff)) {
    if (daysDiff < 1) score += 5;
    else if (daysDiff < 3) score += 3;
    else if (daysDiff < 7) score += 1;
  }
  return score;
}

function generateId(url) {
  try {
    return Buffer.from(url).toString('base64').replace(/[^a-zA-Z0-9]/g, '').substring(0, 16);
  } catch (_) {
    return Math.random().toString(36).slice(2, 10);
  }
}

function processNewsData(articles) {
  return (articles || [])
    .filter(
      (article) =>
        article &&
        article.title &&
        article.description &&
        article.urlToImage &&
        !String(article.title).includes('[Removed]')
    )
    .map((article) => ({
      id: generateId(article.url),
      title: article.title,
      description: article.description,
      url: article.url,
      imageUrl: article.urlToImage,
      publishedAt: article.publishedAt,
      source: (article.source && article.source.name) || 'Fuente desconocida',
      category: categorizeNews(article),
      relatedCourses: findRelatedCourses(article),
      relevanceScore: calculateRelevance(article),
    }))
    .sort((a, b) => b.relevanceScore - a.relevanceScore);
}

function getFallbackNews() {
  return [
    {
      id: 'fallback-1',
      title: 'Python domina el ranking de programación en 2024',
      description:
        'Python mantiene su posición como lenguaje más popular, con fuerte adopción en IA, ciencia de datos y desarrollo web.',
      url: 'https://www.python.org/success-stories/',
      imageUrl:
        'https://images.unsplash.com/photo-1526379095098-d400fd0bf935?w=800&h=600&fit=crop&crop=entropy&auto=format&q=80',
      publishedAt: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(),
      source: 'Tech News Daily',
      category: 'programming',
      relatedCourses: ['Programación Python básico', 'Programación Python intermedio'],
      relevanceScore: 10,
    },
    {
      id: 'fallback-2',
      title: 'El mercado de IA y ML crece 35% este año',
      description:
        'La demanda de profesionales en IA y ML se dispara, con fuertes inversiones en automatización y sistemas inteligentes.',
      url: 'https://www.kaggle.com/learn',
      imageUrl:
        'https://images.unsplash.com/photo-1555255707-c07966088b7b?w=800&h=600&fit=crop&crop=entropy&auto=format&q=80',
      publishedAt: new Date(Date.now() - 1000 * 60 * 60 * 18).toISOString(),
      source: 'AI Weekly',
      category: 'ai_ml',
      relatedCourses: ['Machine Learning', 'Deep Learning', 'Inteligencia Artificial'],
      relevanceScore: 9,
    },
    {
      id: 'fallback-3',
      title: 'Avances en ciberseguridad: nuevas estrategias para 2024',
      description:
        'La ciberseguridad evoluciona con mejores herramientas y metodologías para proteger infraestructuras críticas y datos sensibles.',
      url: 'https://owasp.org/',
      imageUrl:
        'https://images.unsplash.com/photo-1556157382-97eda2d62296?w=800&h=600&fit=crop&crop=entropy&auto=format&q=80',
      publishedAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
      source: 'Security Today',
      category: 'cybersecurity',
      relatedCourses: ['Cyberseguridad', 'Hacking ético'],
      relevanceScore: 8,
    },
  ];
}

app.get('/api/news', async (req, res) => {
  const category = String(req.query.category || '').trim() || null;
  const limit = Math.max(1, Math.min(50, Number(req.query.limit) || 6));

  const techKeywords = [
    'technology',
    'programming',
    'artificial intelligence',
    'machine learning',
    'cybersecurity',
    'cloud computing',
    'data science',
    'software development',
    'web development',
    'mobile development',
    'blockchain',
    'IoT',
  ];

  const keywords = category ? getCategoryKeywords(category) : techKeywords;
  const query = keywords.length ? keywords.join(' OR ') : techKeywords.join(' OR ');

  const apiKey = process.env.NEWS_API_KEY;
  if (!apiKey) {
    // Sin API key: devolver fallback para que el sistema siga funcionando
    return res.json({ articles: getFallbackNews().slice(0, limit) });
  }

  try {
    const url = `https://newsapi.org/v2/everything?q=${encodeURIComponent(query)}&language=en&sortBy=publishedAt&pageSize=${limit}`;
    const data = await fetchJSON(url, { 'X-Api-Key': apiKey });
    if (!data || !Array.isArray(data.articles)) {
      return res.json({ articles: getFallbackNews().slice(0, limit) });
    }
    const processed = processNewsData(data.articles).slice(0, limit);
    return res.json({ articles: processed });
  } catch (err) {
    console.error('Error /api/news:', err);
    return res.json({ articles: getFallbackNews().slice(0, limit) });
  }
});

// Chatbot inteligente básico con integración a BD
app.post('/api/chat', async (req, res) => {
  try {
    const { message, history, profile } = req.body || {};
    const text = String(message || '').toLowerCase();

    let intent = 'general';
    let reply = '';

    const suggest = (arr) => arr.filter(Boolean).slice(0, 6);

    // Detectar intents por palabras clave
    const has = (r) => r.test(text);
    const intents = [
      { key: 'horarios', test: /(horario|hora|mañana|tarde|noche|sabado|sábado)/ },
      { key: 'cursos', test: /(curso|cursos|programaci[oó]n|python|java|dise[nñ]o|power\s*bi|excel|laravel|go|kotlin)/ },
      { key: 'programas', test: /(programa|programas|área|areas|áreas)/ },
      { key: 'certificados', test: /(certificado|certificaci[oó]n|validar|verificar)/ },
      { key: 'inscripcion', test: /(inscripci[oó]n|inscribir|matr[ií]cula|registrar)/ },
      { key: 'costos', test: /(precio|costo|cu[aá]nto|tarifa)/ },
      { key: 'ubicacion', test: /(ubicaci[oó]n|direcci[oó]n|d[oó]nde)/ },
      { key: 'contacto', test: /(contacto|whatsapp|tel[eé]fono|correo|email)/ },
    ];
    for (const i of intents) {
      if (has(i.test)) { intent = i.key; break; }
    }

    // Intento de detección de curso específico por sinónimos
    const courseSynonyms = [
      { term: 'python', re: /python/ },
      { term: 'java', re: /\bjava\b/ },
      { term: 'c\+\+', re: /c\+\+/ },
      { term: 'c#', re: /\bc#\b/ },
      { term: 'power bi', re: /power\s*bi/ },
      { term: 'excel', re: /\bexcel\b/ },
      { term: 'laravel', re: /\blaravel\b/ },
      { term: 'go', re: /\bgo\b/ },
      { term: 'kotlin', re: /\bkotlin\b/ },
      { term: 'photoshop', re: /photoshop/ },
      { term: 'illustrator', re: /illustrator/ },
      { term: 'after effects', re: /after\s*effects/ },
      { term: 'premiere', re: /premiere/ },
      { term: 'indesign', re: /indesign/ },
      { term: 'corel', re: /corel/ },
    ];
    let matchedTerm = null;
    for (const s of courseSynonyms) {
      if (s.re.test(text)) { matchedTerm = s.term; break; }
    }

    // Si se detecta un término de curso, intentar devolver detalle
    if (matchedTerm) {
      try {
        // Selección dinámica de columnas según existencia
        const cols = ['id', 'nombre'];
        if (await hasCursosColumn('modalidad')) cols.push('modalidad');
        if (await hasCursosColumn('instructor')) cols.push('instructor');
        if (await hasCursosColumn('horario')) cols.push('horario');
        if (await hasCursosColumn('duracion')) cols.push('duracion');
        if (await hasCursosColumn('horas_academicas')) cols.push('horas_academicas');
        if (await hasCursosColumn('descripcion')) cols.push('descripcion');
        const selectClause = cols.join(', ');

        const [rows] = await pool.query(
          `SELECT ${selectClause} FROM cursos WHERE LOWER(nombre) LIKE ? ORDER BY id DESC LIMIT 1`,
          [ `%${matchedTerm.toLowerCase()}%` ]
        );

        if (rows && rows.length) {
          const r = rows[0];
          const modalidad = (r.modalidad || 'VIRTUAL');
          const instructor = r.instructor || '';
          const horarioTexto = r.horario || '';
          const duracion = r.duracion || r.horas_academicas || '';
          const descripcion = r.descripcion || '';

          // Intentar obtener horario desde tabla de horarios CN{id}
          let dias = '';
          try {
            const [hrows] = await pool.query(
              'SELECT dias FROM horarios WHERE grupo = ? AND estado = "activo" LIMIT 1',
              [ `CN${r.id}` ]
            );
            if (hrows && hrows.length) dias = hrows[0].dias || '';
          } catch (_) {}

          const partes = [
            `${r.nombre} — ${modalidad}${instructor ? `, Docente: ${instructor}` : ''}`,
            dias ? `Horarios: ${dias}` : (horarioTexto ? `Horarios: ${horarioTexto}` : ''),
            duracion ? `Duración: ${duracion}` : '',
            descripcion ? `Descripción: ${descripcion}` : ''
          ].filter(Boolean);

          // Personalización simple si se proporciona perfil
          const namePrefix = profile && profile.name ? `Hola ${profile.name}, ` : '';
          reply = `${namePrefix}${partes.join('\n')}`;

          const suggestions = suggest([
            'Ver cursos activos',
            'Consultar horarios',
            'Cómo me inscribo',
          ]);

          // Enlaces de acción rápida para frontend
          const links = {
            course: `/detalles/${r.id}`,
            enroll: `/matricula`
          };

          return res.json({ reply, intent: 'curso_detalle', suggestions, links, course: { id: r.id, nombre: r.nombre } });
        }
      } catch (e) {
        // Continuar con flujo normal si falla
      }
    }

    // Responder según intent con datos reales cuando sea posible
    if (intent === 'cursos') {
      const [rows] = await pool.query(`
        SELECT c.id, c.nombre, COALESCE(c.modalidad,'VIRTUAL') AS modalidad,
               COALESCE(c.instructor,'') AS instructor,
               COALESCE(p.nombre,'General') AS programa
        FROM cursos c
        LEFT JOIN programas p ON p.id = c.programa_id
        WHERE COALESCE(c.estado,'activo') = 'activo'
        ORDER BY c.id DESC
        LIMIT 8
      `);
      if (rows.length) {
        const list = rows.map(r => `• ${r.nombre} — ${r.modalidad}${r.instructor ? `, Docente: ${r.instructor}` : ''} (${r.programa})`).join('\n');
        reply = `Te comparto algunos cursos activos:\n\n${list}\n\n¿Quieres que te detalle uno específico o ver más?`;
      } else {
        reply = 'Por ahora no tengo cursos activos en la base. ¿Te gustaría que te recomiende según tus intereses?';
      }
    } else if (intent === 'horarios') {
      const [rows] = await pool.query(`
        SELECT nombre_curso, dias, COALESCE(modalidad,'VIRTUAL') AS modalidad
        FROM horarios
        WHERE estado = 'activo'
        ORDER BY nombre_curso
        LIMIT 10
      `);
      if (rows.length) {
        const list = rows.map(r => `• ${r.nombre_curso} — ${r.dias} (${r.modalidad})`).join('\n');
        reply = `Estos son horarios publicados recientemente:\n\n${list}\n\n¿Deseas saber si hay disponibilidad en alguno?`;
      } else {
        reply = 'Aún no hay horarios cargados. Puedo avisarte apenas se publiquen. ¿Qué curso te interesa?';
      }
    } else if (intent === 'programas') {
      const [rows] = await pool.query(`
        SELECT id, nombre FROM programas ORDER BY nombre ASC LIMIT 12
      `);
      if (rows.length) {
        const list = rows.map(r => `• ${r.nombre}`).join('\n');
        reply = `Trabajamos en estas áreas académicas:\n\n${list}\n\n¿Deseas ver cursos de alguna área?`;
      } else {
        reply = 'Aún no tengo áreas registradas en el sistema. ¿Qué temática te interesa (programación, datos, diseño, ofimática)?';
      }
    } else if (intent === 'certificados') {
      reply = 'Puedes validar certificados ingresando a la sección Certificados > Validar y completando tus datos. Si tienes el código de verificación, compártelo y te guío.';
    } else if (intent === 'inscripcion') {
      reply = 'Para inscribirte: elige el curso, completa el formulario y realiza el pago (presencial o digital). ¿En qué curso deseas reservar cupo?';
    } else if (intent === 'costos') {
      reply = 'Los costos dependen del curso y duración. Te paso el detalle apenas me indiques el curso de interés. También contamos con descuentos para estudiantes UNA.';
    } else if (intent === 'ubicacion') {
      reply = 'Estamos en la Ciudad Universitaria de la Universidad Nacional del Altiplano (Puno). Fácil acceso y estacionamiento disponible.';
    } else if (intent === 'contacto') {
      reply = 'Puedes escribirnos por WhatsApp, correo institucional o visitarnos en oficinas. ¿Prefieres que te comparta el WhatsApp para atención inmediata?';
    } else {
      // Conversación general con tono humano
      reply = '¡Me alegra ayudarte! Cuéntame qué te interesa aprender (programación, análisis de datos, diseño, ofimática) y te recomiendo opciones con horarios, docentes y certificación.';
    }

    const suggestions = suggest([
      intent !== 'cursos' && 'Ver cursos activos',
      intent !== 'horarios' && 'Consultar horarios',
      intent !== 'programas' && 'Explorar programas',
      intent !== 'inscripcion' && 'Cómo me inscribo',
      intent !== 'costos' && 'Información de costos',
      intent !== 'certificados' && 'Validar certificado',
    ]);

    // Personalización simple para respuestas generales
    const namePrefix = profile && profile.name ? `Hola ${profile.name}, ` : '';
    const personalizedReply = namePrefix ? `${namePrefix}${reply}` : reply;

    res.json({ reply: personalizedReply, intent, suggestions });
  } catch (error) {
    console.error('Chat error:', error);
    res.status(200).json({
      reply: 'Estoy con alta demanda ahora mismo. ¿Te parece si me dices el curso que te interesa y te paso horarios y detalles? También puedo ayudarte con inscripción y certificados.',
      intent: 'general',
      suggestions: ['Ver cursos activos', 'Consultar horarios', 'Cómo me inscribo']
    });
  }
});

// Endpoint para validar usuario y obtener certificados públicos
app.post('/api/certificados/validar', async (req, res) => {
  try {
    const { dni, nombres, apellidoPaterno, apellidoMaterno, fechaNacimiento, codigoEstudiante } = req.body;
    
    // Validar campos requeridos
    if (!dni || !nombres || !apellidoPaterno || !apellidoMaterno || !fechaNacimiento) {
      return res.status(400).json({ error: 'Todos los campos son obligatorios' });
    }
    
    // Buscar certificados que coincidan con los datos del usuario
    const [certificados] = await pool.execute(`
      SELECT 
        id,
        codigo_verificacion as codigo,
        dni,
        nombre_completo,
        nombre_evento as programa,
        tipo_certificado,
        'Presencial' as modalidad,
        horas_academicas as duracion,
        DATE_FORMAT(fecha_inicio, '%d/%m/%Y') as fecha_inicio,
        DATE_FORMAT(fecha_fin, '%d/%m/%Y') as fecha_culminacion,
        'APROBADO' as calificacion,
        CASE 
          WHEN activo = 1 THEN 'APROBADO'
          ELSE 'PENDIENTE'
        END as estado,
        DATE_FORMAT(fecha_emision, '%d/%m/%Y') as fecha_emision
      FROM certificados 
      WHERE dni = ? 
        AND LOWER(TRIM(nombre_completo)) LIKE LOWER(CONCAT('%', TRIM(?), '%', TRIM(?), '%', TRIM(?), '%'))
        AND activo = 1
      ORDER BY fecha_emision DESC
    `, [dni, nombres, apellidoPaterno, apellidoMaterno]);
    
    if (certificados.length > 0) {
      // Usuario válido, devolver datos
      const usuario = {
        dni: dni,
        nombres: nombres,
        apellido_paterno: apellidoPaterno,
        apellido_materno: apellidoMaterno
      };
      
      res.json({
        valido: true,
        usuario: usuario,
        certificados: certificados
      });
    } else {
      // No se encontraron certificados
      res.json({
        valido: false,
        mensaje: 'No se encontraron certificados con los datos proporcionados'
      });
    }
    
  } catch (error) {
    console.error('Error validating user:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Login route ahora gestionada por el router de auth en /api/auth y /auth (alias)

// Protected route example: get users
app.get('/admin/users', authenticateToken, async (req, res) => {
  try {
    // Intento estático inicial - ajustado para esquema conocido (full_name existe, no name)
    const [rows] = await pool.query(`
      SELECT 
        id, 
        username, 
        email, 
        full_name,
        role 
      FROM users
      ORDER BY id DESC
    `);

    const normalizedRows = rows.map(row => ({
      id: row.id,
      username: row.username,
      email: row.email,
      full_name: row.full_name || null,
      role: row.role || 'user'
    }));

    return res.json(normalizedRows);
  } catch (error) {
    // Fallback dinámico dentro de su propio try/catch
    try {
      // Detectar tabla: users o usuarios
      const [tables] = await pool.query(
        "SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME IN ('users','usuarios')"
      );
      const tableNames = tables.map(t => t.TABLE_NAME);
      let table = null;
      if (tableNames.includes('users')) table = 'users';
      else if (tableNames.includes('usuarios')) table = 'usuarios';
      else {
        return res.json([]); // No hay tabla de usuarios, evitar 500
      }

      // Descubrir columnas reales
      const [columns] = await pool.query(`SHOW COLUMNS FROM ${table}`);
      const colNames = columns.map(c => c.Field);
      if (!columns || columns.length === 0) {
        return res.json([]);
      }

      // Construir SELECT dinámico seguro
      const selectCols = [];
      const idCol = colNames.includes('id') ? 'id' : null;
      let usernameCol = null;
      let emailCol = null;
      let nameCol = null;
      let roleCol = null;

      if (table === 'users') {
        if (idCol) selectCols.push(idCol);
        if (colNames.includes('username')) { selectCols.push('username'); usernameCol = 'username'; }
        if (colNames.includes('email')) { selectCols.push('email'); emailCol = 'email'; }
        if (colNames.includes('name')) { selectCols.push('name'); nameCol = 'name'; }
        else if (colNames.includes('full_name')) { selectCols.push('full_name'); nameCol = 'full_name'; }
        if (colNames.includes('role')) { selectCols.push('role'); roleCol = 'role'; }
      } else {
        // Tabla 'usuarios'
        if (idCol) selectCols.push(idCol);
        if (colNames.includes('nombre')) { selectCols.push('nombre'); nameCol = 'nombre'; }
        if (colNames.includes('email')) { selectCols.push('email'); emailCol = 'email'; }
        if (colNames.includes('rol')) { selectCols.push('rol'); roleCol = 'rol'; }
        if (colNames.includes('username')) { selectCols.push('username'); usernameCol = 'username'; }
        else if (colNames.includes('usuario')) { selectCols.push('usuario'); usernameCol = 'usuario'; }
      }

      const selectClause = selectCols.length ? selectCols.join(', ') : '*';
      const orderCol = idCol ? idCol : (colNames.includes('created_at') ? 'created_at' : null);

      const sql = `SELECT ${selectClause} FROM ${table}${orderCol ? ` ORDER BY ${orderCol} DESC` : ''}`;
      const [rows] = await pool.query(sql);

      const normalizedRows = rows.map(row => ({
        id: idCol ? row[idCol] ?? null : (row.id ?? null),
        username: usernameCol ? row[usernameCol] ?? null : (row.username ?? row.usuario ?? null),
        email: emailCol ? row[emailCol] ?? null : (row.email ?? null),
        full_name: nameCol ? row[nameCol] ?? null : (row.full_name ?? row.name ?? row.nombre ?? null),
        role: roleCol ? row[roleCol] ?? 'user' : (row.role ?? row.rol ?? 'user'),
      }));

      return res.json(normalizedRows);
    } catch (err) {
      console.error('Error fetching users:', err);
      if (err.code === 'ER_NO_SUCH_TABLE' || err.code === 'ER_BAD_FIELD_ERROR') {
        return res.json([]);
      }
      return res.status(500).json({ error: 'Error al obtener usuarios', details: err.message });
    }
  }
});

// Create new user
app.post('/admin/users', authenticateToken, async (req, res) => {
  try {
    const { username, email, password, role, full_name } = req.body;
    
    if (!username || !email || !password) {
      return res.status(400).json({ error: 'Username, email y password son requeridos' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'La contraseña debe tener al menos 6 caracteres' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Verificar estructura segura: exigir password_hash y prohibir password legado
    const [columns] = await pool.query('SHOW COLUMNS FROM users');
    const columnNames = columns.map(col => col.Field);
    if (columnNames.includes('password')) {
      return res.status(500).json({ error: 'Esquema inseguro: columna legacy users.password detectada. Migra a password_hash.' });
    }
    if (!columnNames.includes('password_hash')) {
      return res.status(500).json({ error: 'Esquema inválido: falta columna users.password_hash.' });
    }
    const hasName = columnNames.includes('name');
    const hasFullName = columnNames.includes('full_name');
    const nameColumn = hasName ? 'name' : (hasFullName ? 'full_name' : 'username');
    const [result] = await pool.query(
      `INSERT INTO users (username, email, password_hash, role, ${nameColumn}) VALUES (?, ?, ?, ?, ?)`,
      [username, email, hashedPassword, role || 'user', full_name || null]
    );
    
    res.status(201).json({ 
      message: 'Usuario creado exitosamente',
      id: result.insertId 
    });
  } catch (error) {
    console.error('Error creating user:', error);
    if (error.code === 'ER_DUP_ENTRY') {
      res.status(400).json({ error: 'El username o email ya existe' });
    } else {
      res.status(500).json({ error: 'Error al crear usuario', details: error.message });
    }
  }
});

// Update user
app.put('/admin/users/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { username, email, role, password, full_name } = req.body;
    
    if (!username || !email) {
      return res.status(400).json({ error: 'Username y email son requeridos' });
    }
    
    if (password && password.length < 6) {
      return res.status(400).json({ error: 'La contraseña debe tener al menos 6 caracteres' });
    }
    
    // Verificar estructura segura
    const [columns] = await pool.query('SHOW COLUMNS FROM users');
    const columnNames = columns.map(col => col.Field);
    if (columnNames.includes('password')) {
      return res.status(500).json({ error: 'Esquema inseguro: columna legacy users.password detectada. Migra a password_hash.' });
    }
    if (!columnNames.includes('password_hash')) {
      return res.status(500).json({ error: 'Esquema inválido: falta columna users.password_hash.' });
    }
    const hasName = columnNames.includes('name');
    const hasFullName = columnNames.includes('full_name');
    const nameColumn = hasName ? 'name' : (hasFullName ? 'full_name' : 'username');
    
    let query = `UPDATE users SET username = ?, email = ?, role = ?, ${nameColumn} = ?`;
    let params = [username, email, role || 'user', full_name || null];
    
    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      query += `, password_hash = ?`;
      params.push(hashedPassword);
    }
    
    query += ' WHERE id = ?';
    params.push(id);
    
    const [result] = await pool.query(query, params);
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }
    
    res.json({ message: 'Usuario actualizado exitosamente' });
  } catch (error) {
    console.error('Error updating user:', error);
    if (error.code === 'ER_DUP_ENTRY') {
      res.status(400).json({ error: 'El username o email ya existe' });
    } else {
      res.status(500).json({ error: 'Error al actualizar usuario', details: error.message });
    }
  }
});

// Delete user
app.delete('/admin/users/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    
    const [result] = await pool.query('DELETE FROM users WHERE id = ?', [id]);
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }
    
    res.json({ message: 'Usuario eliminado exitosamente' });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ error: 'Error al eliminar usuario' });
  }
});

// ===== ENDPOINTS PARA MÓDULOS =====
app.get('/admin/modulos', authenticateToken, async (req, res) => {
  try {
    const { programa_id } = req.query;
    const base = programa_id
      ? 'SELECT * FROM modulos WHERE programa_id = ?'
      : 'SELECT * FROM modulos';
    // Ordenar por una columna que sabemos que existe siempre
    const sql = `${base} ORDER BY id DESC`;
    const params = programa_id ? [programa_id] : [];
    const [rows] = await pool.query(sql, params);
    res.json(rows);
  } catch (error) {
    console.error('Error fetching modulos:', error);
    // Si la tabla no existe, devolver arreglo vacío para evitar romper la UI
    if (error.code === 'ER_NO_SUCH_TABLE') {
      return res.json([]);
    }
    res.status(500).json({ error: 'Error al obtener módulos' });
  }
});

app.post('/admin/modulos', authenticateToken, async (req, res) => {
  try {
    const { nombre, descripcion, numero, programa_id, estado } = req.body;
    if (!nombre || !programa_id) {
      return res.status(400).json({ error: 'Nombre y programa son requeridos' });
    }
    // Validar que el programa exista
    const [progRows] = await pool.query('SELECT id FROM programas WHERE id = ?', [programa_id]);
    if (!Array.isArray(progRows) || progRows.length === 0) {
      return res.status(400).json({ error: 'El programa seleccionado no existe' });
    }
    const [result] = await pool.query(
      'INSERT INTO modulos (programa_id, nombre, descripcion, numero, estado) VALUES (?, ?, ?, ?, ?)',
      [programa_id, nombre, descripcion || null, numero || null, estado || 'activo']
    );
    res.status(201).json({ message: 'Módulo creado exitosamente', id: result.insertId });
  } catch (error) {
    console.error('Error creating modulo:', error);
    res.status(500).json({ error: 'Error al crear módulo' });
  }
});

app.put('/admin/modulos/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, descripcion, numero, programa_id, estado } = req.body;

    const [existing] = await pool.query('SELECT * FROM modulos WHERE id = ?', [id]);
    if (existing.length === 0) return res.status(404).json({ error: 'Módulo no encontrado' });

    // Si se envía programa_id, validar que exista
    if (programa_id) {
      const [progRows] = await pool.query('SELECT id FROM programas WHERE id = ?', [programa_id]);
      if (!Array.isArray(progRows) || progRows.length === 0) {
        return res.status(400).json({ error: 'El programa seleccionado no existe' });
      }
    }

    const [result] = await pool.query(
      'UPDATE modulos SET programa_id = ?, nombre = ?, descripcion = ?, numero = ?, estado = ? WHERE id = ?',
      [
        programa_id || existing[0].programa_id,
        nombre || existing[0].nombre,
        descripcion ?? existing[0].descripcion,
        numero ?? existing[0].numero,
        estado || existing[0].estado,
        id
      ]
    );
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Módulo no encontrado' });
    res.json({ message: 'Módulo actualizado exitosamente' });
  } catch (error) {
    console.error('Error updating modulo:', error);
    res.status(500).json({ error: 'Error al actualizar módulo' });
  }
});

app.delete('/admin/modulos/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const [result] = await pool.query('DELETE FROM modulos WHERE id = ?', [id]);
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Módulo no encontrado' });
    res.json({ message: 'Módulo eliminado exitosamente' });
  } catch (error) {
    console.error('Error deleting modulo:', error);
    res.status(500).json({ error: 'Error al eliminar módulo' });
  }
});

// ===== AJUSTES EN CURSOS PARA SOPORTAR modulo_id =====
app.post('/admin/cursos', authenticateToken, async (req, res) => {
  try {
    const { nombre, descripcion, duracion, precio, modalidad, programa_id, duracion_horas, estado, horario, instructor, nivel, modulo_id, imagen } = req.body;
    if (!nombre || !descripcion || !programa_id) {
      return res.status(400).json({ error: 'Nombre, descripción y programa son requeridos' });
    }

    // Validar que el programa exista
    const [progRows] = await pool.query('SELECT id FROM programas WHERE id = ?', [programa_id]);
    if (!Array.isArray(progRows) || progRows.length === 0) {
      return res.status(400).json({ error: 'El programa seleccionado no existe' });
    }

    // Validación: si existe la columna modulo_id y se envía, debe pertenecer al programa_id
    if (modulo_id && await hasCursosColumn('modulo_id')) {
      const [modRows] = await pool.query('SELECT id, programa_id FROM modulos WHERE id = ?', [modulo_id]);
      if (!Array.isArray(modRows) || modRows.length === 0) {
        return res.status(400).json({ error: 'Módulo seleccionado no existe' });
      }
      if (String(modRows[0].programa_id) !== String(programa_id)) {
        return res.status(400).json({ error: 'El módulo seleccionado no pertenece al programa elegido' });
      }
    }
    // Normalizar precio (soporta coma decimal)
    const precioNum = (precio === undefined || precio === null || precio === '')
      ? 0
      : Number(String(precio).replace(',', '.')) || 0;

    // Construir INSERT dinámico según columnas existentes
    const colsSet = await getCursosColumns();
    const insertCols = ['programa_id', 'nombre', 'descripcion', 'modalidad', 'horario', 'duracion', 'instructor', 'nivel'];
    const insertVals = [programa_id, nombre, descripcion, modalidad || 'presencial', horario || null, duracion_horas || duracion || null, instructor || null, nivel || null];

    if (colsSet.has('modulo_id')) { insertCols.push('modulo_id'); insertVals.push(modulo_id || null); }
    if (colsSet.has('precio')) { insertCols.push('precio'); insertVals.push(precioNum); }
    if (colsSet.has('estado')) { insertCols.push('estado'); insertVals.push(estado || 'activo'); }
    if (colsSet.has('imagen')) { insertCols.push('imagen'); insertVals.push(imagen || null); }

    const placeholders = insertCols.map(() => '?').join(', ');
    const sql = `INSERT INTO cursos (${insertCols.join(', ')}) VALUES (${placeholders})`;
    const [result] = await pool.query(sql, insertVals);
    res.status(201).json({ message: 'Curso creado exitosamente', id: result.insertId });
  } catch (error) {
    console.error('Error creating course:', error);
    if (error.code === 'ER_DUP_ENTRY') return res.status(400).json({ error: 'Ya existe un curso con ese nombre' });
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

app.put('/admin/cursos/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, descripcion, duracion, precio, modalidad, programa_id, duracion_horas, estado, horario, instructor, nivel, modulo_id, imagen } = req.body;
    if (!nombre || !descripcion || !programa_id) {
      return res.status(400).json({ error: 'Nombre, descripción y programa son requeridos' });
    }

    // Validar que el programa exista
    const [progRowsUpdate] = await pool.query('SELECT id FROM programas WHERE id = ?', [programa_id]);
    if (!Array.isArray(progRowsUpdate) || progRowsUpdate.length === 0) {
      return res.status(400).json({ error: 'El programa seleccionado no existe' });
    }

    // Validación: si existe la columna modulo_id y se envía, debe pertenecer al programa_id
    if (modulo_id && await hasCursosColumn('modulo_id')) {
      const [modRows] = await pool.query('SELECT id, programa_id FROM modulos WHERE id = ?', [modulo_id]);
      if (!Array.isArray(modRows) || modRows.length === 0) {
        return res.status(400).json({ error: 'Módulo seleccionado no existe' });
      }
      if (String(modRows[0].programa_id) !== String(programa_id)) {
        return res.status(400).json({ error: 'El módulo seleccionado no pertenece al programa elegido' });
      }
    }
    // Normalizar precio (soporta coma decimal)
    const precioNum = (precio === undefined || precio === null || precio === '')
      ? 0
      : Number(String(precio).replace(',', '.')) || 0;
    // Construir UPDATE dinámico según columnas existentes
    const colsSet = await getCursosColumns();
    const setClauses = ['programa_id = ?', 'nombre = ?', 'descripcion = ?', 'modalidad = ?', 'horario = ?', 'duracion = ?', 'instructor = ?', 'nivel = ?'];
    const params = [programa_id, nombre, descripcion, modalidad || 'presencial', horario || null, (duracion_horas || duracion || null), instructor || null, nivel || null];

    if (colsSet.has('modulo_id')) { setClauses.push('modulo_id = ?'); params.push(modulo_id || null); }
    if (colsSet.has('precio')) { setClauses.push('precio = ?'); params.push(precioNum); }
    if (colsSet.has('estado')) { setClauses.push('estado = ?'); params.push(estado || 'activo'); }
    if (colsSet.has('imagen')) { setClauses.push('imagen = ?'); params.push(imagen || null); }

    const sql = `UPDATE cursos SET ${setClauses.join(', ')} WHERE id = ?`;
    params.push(id);
    const [result] = await pool.query(sql, params);
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Curso no encontrado' });
    res.json({ message: 'Curso actualizado exitosamente' });
  } catch (error) {
    console.error('Error updating course:', error);
    if (error.code === 'ER_DUP_ENTRY') return res.status(400).json({ error: 'Ya existe un curso con ese nombre' });
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Eliminar curso
app.delete('/admin/cursos/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    
    const [result] = await pool.query('DELETE FROM cursos WHERE id = ?', [id]);
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Curso no encontrado' });
    }
    
    res.json({ message: 'Curso eliminado exitosamente' });
  } catch (error) {
    console.error('Error deleting course:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Subida de imagen para curso (opcional)
app.post('/admin/cursos/upload-image', authenticateToken, uploadCursoImagen.single('imagen'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No se ha subido ningún archivo' });
    }
    if (STORAGE_PROVIDER === 'supabase') {
      const supabase = getSupabase();
      if (!supabase) return res.status(500).json({ error: 'Supabase no configurado' });
      const ext = path.extname(req.file.originalname || '').toLowerCase() || '.jpg';
      const unique = `curso-${Date.now()}-${Math.round(Math.random()*1e9)}${ext}`;
      const { error: upErr } = await supabase.storage.from('cursos').upload(unique, req.file.buffer, {
        contentType: req.file.mimetype || 'image/jpeg',
        upsert: false
      });
      if (upErr) {
        console.error('Error uploading to Supabase:', upErr.message || upErr);
        return res.status(500).json({ error: 'Error al subir imagen' });
      }
      const { data } = supabase.storage.from('cursos').getPublicUrl(unique);
      const imageUrl = data?.publicUrl || '';
      return res.json({ message: 'Imagen subida exitosamente', imageUrl, filename: unique });
    }
    const imageUrl = `/uploads/cursos/${req.file.filename}`;
    res.json({ message: 'Imagen subida exitosamente', imageUrl, filename: req.file.filename });
  } catch (error) {
    console.error('Error uploading course image:', error);
    res.status(500).json({ error: 'Error al subir imagen' });
  }
});

// ===== ENDPOINTS PARA MATRÍCULAS =====

// Obtener todas las matrículas
app.get('/admin/matriculas', authenticateToken, async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT m.*, u.username, u.email, c.nombre as curso_nombre, p.nombre as programa_nombre 
      FROM matriculas m 
      LEFT JOIN users u ON m.usuario_id = u.id 
      LEFT JOIN cursos c ON m.curso_id = c.id 
      LEFT JOIN programas p ON c.programa_id = p.id 
      ORDER BY m.fecha_matricula DESC
    `);
    res.json(rows);
  } catch (error) {
    console.error('Error fetching matriculas:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Crear nueva matrícula
app.post('/admin/matriculas', authenticateToken, async (req, res) => {
  try {
    const { usuario_id, curso_id, estado, fecha_matricula } = req.body;
    
    if (!usuario_id || !curso_id) {
      return res.status(400).json({ error: 'Usuario y curso son requeridos' });
    }
    
    // Verificar si ya existe una matrícula activa
    const [existing] = await pool.query(
      'SELECT id FROM matriculas WHERE usuario_id = ? AND curso_id = ? AND estado IN ("activo", "completado")',
      [usuario_id, curso_id]
    );
    
    if (existing.length > 0) {
      return res.status(400).json({ error: 'Ya existe una matrícula activa para este usuario en este curso' });
    }
    
    const [result] = await pool.query(
      'INSERT INTO matriculas (usuario_id, curso_id, estado, fecha_matricula) VALUES (?, ?, ?, ?)',
      [usuario_id, curso_id, estado || 'activo', fecha_matricula || new Date().toISOString().split('T')[0]]
    );
    
    res.status(201).json({ 
      message: 'Matrícula creada exitosamente',
      id: result.insertId 
    });
  } catch (error) {
    console.error('Error creating matricula:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Actualizar matrícula
app.put('/admin/matriculas/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { usuario_id, curso_id, estado, fecha_matricula } = req.body;
    
    if (!usuario_id || !curso_id) {
      return res.status(400).json({ error: 'Usuario y curso son requeridos' });
    }
    
    const [result] = await pool.query(
      'UPDATE matriculas SET usuario_id = ?, curso_id = ?, estado = ?, fecha_matricula = ? WHERE id = ?',
      [usuario_id, curso_id, estado || 'activo', fecha_matricula || new Date().toISOString().split('T')[0], id]
    );
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Matrícula no encontrada' });
    }
    
    res.json({ message: 'Matrícula actualizada exitosamente' });
  } catch (error) {
    console.error('Error updating matricula:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Eliminar matrícula
app.delete('/admin/matriculas/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    
    const [result] = await pool.query('DELETE FROM matriculas WHERE id = ?', [id]);
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Matrícula no encontrada' });
    }
    
    res.json({ message: 'Matrícula eliminada exitosamente' });
  } catch (error) {
    console.error('Error deleting matricula:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// ===== ENDPOINTS PARA DOCENTES =====

// Obtener todos los docentes
app.get('/admin/docentes', authenticateToken, async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT * FROM docentes 
      ORDER BY fecha_creacion DESC
    `);
    res.json(rows);
  } catch (error) {
    console.error('Error fetching docentes:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Crear nuevo docente
app.post('/admin/docentes', authenticateToken, async (req, res) => {
  try {
    const { nombre, apellido, email, telefono, especialidad, grado_academico, experiencia, estado } = req.body;
    
    if (!nombre || !apellido || !email) {
      return res.status(400).json({ error: 'Nombre, apellido y email son requeridos' });
    }
    
    // Verificar si ya existe un docente con el mismo email
    const [existing] = await pool.query('SELECT id FROM docentes WHERE email = ?', [email]);
    
    if (existing.length > 0) {
      return res.status(400).json({ error: 'Ya existe un docente con este email' });
    }
    
    const [result] = await pool.query(
      'INSERT INTO docentes (nombre, apellido, email, telefono, especialidad, grado_academico, experiencia, estado) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [nombre, apellido, email, telefono || null, especialidad || null, grado_academico || null, experiencia || null, estado || 'activo']
    );
    
    res.status(201).json({ 
      message: 'Docente creado exitosamente',
      id: result.insertId 
    });
  } catch (error) {
    console.error('Error creating docente:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Actualizar docente
app.put('/admin/docentes/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, apellido, email, telefono, especialidad, grado_academico, experiencia, estado } = req.body;
    
    if (!nombre || !apellido || !email) {
      return res.status(400).json({ error: 'Nombre, apellido y email son requeridos' });
    }
    
    // Verificar si existe otro docente con el mismo email
    const [existing] = await pool.query('SELECT id FROM docentes WHERE email = ? AND id != ?', [email, id]);
    
    if (existing.length > 0) {
      return res.status(400).json({ error: 'Ya existe otro docente con este email' });
    }
    
    const [result] = await pool.query(
      'UPDATE docentes SET nombre = ?, apellido = ?, email = ?, telefono = ?, especialidad = ?, grado_academico = ?, experiencia = ?, estado = ? WHERE id = ?',
      [nombre, apellido, email, telefono || null, especialidad || null, grado_academico || null, experiencia || null, estado || 'activo', id]
    );
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Docente no encontrado' });
    }
    
    res.json({ message: 'Docente actualizado exitosamente' });
  } catch (error) {
    console.error('Error updating docente:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Eliminar docente
app.delete('/admin/docentes/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    
    const [result] = await pool.query('DELETE FROM docentes WHERE id = ?', [id]);
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Docente no encontrado' });
    }
    
    res.json({ message: 'Docente eliminado exitosamente' });
  } catch (error) {
    console.error('Error deleting docente:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Additional admin routes
app.get('/admin/cursos', authenticateToken, async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM cursos');
    res.json(rows);
  } catch (error) {
    console.error('Error fetching cursos:', error);
    // Return empty array if table doesn't exist
    res.json([]);
  }
});

app.get('/admin/programas', authenticateToken, async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM programas');
    res.json(rows);
  } catch (error) {
    console.error('Error fetching programas:', error);
    // Return empty array if table doesn't exist
    res.json([]);
  }
});



app.get('/admin/reclamaciones', authenticateToken, async (req, res) => {
  try {
    // Columnas reales en reclamaciones y users
    const [recCols] = await pool.query('SHOW COLUMNS FROM reclamaciones');
    const recNames = recCols.map(c => c.Field);

    const [userCols] = await pool.query('SHOW COLUMNS FROM users');
    const userNames = userCols.map(c => c.Field);

    // Campo para ordenar: el primero que exista
    const orderCol = ['creado_en', 'created_at', 'fecha', 'id'].find(c => recNames.includes(c)) || 'id';

    // Expresiones opcionales de usuario
    const hasName = userNames.includes('name');
    const hasFullName = userNames.includes('full_name');
    const hasUsername = userNames.includes('username');
    const hasEmail = userNames.includes('email');

    const userNameExpr = (hasName || hasFullName || hasUsername)
      ? `COALESCE(${hasName ? 'u.name' : 'NULL'}, ${hasFullName ? 'u.full_name' : 'NULL'}, ${hasUsername ? 'u.username' : 'NULL'}) AS usuario_nombre`
      : `NULL AS usuario_nombre`;

    const userEmailExpr = hasEmail ? 'u.email AS usuario_email' : 'NULL AS usuario_email';

    const [rows] = await pool.query(`
      SELECT r.*, ${userNameExpr}, ${userEmailExpr}
      FROM reclamaciones r
      LEFT JOIN users u ON r.usuario_id = u.id
      ORDER BY r.${orderCol} DESC
    `);

    res.json(rows);
  } catch (error) {
    console.error('Error fetching reclamaciones:', error);
    res.status(500).json({ error: 'Error al obtener reclamaciones', details: error.message });
  }
});

app.post('/admin/reclamaciones', authenticateToken, async (req, res) => {
  try {
    const { usuario_id, tipo, descripcion, estado } = req.body;
    
    if (!usuario_id || !tipo || !descripcion) {
      return res.status(400).json({ error: 'Usuario, tipo y descripción son requeridos' });
    }

    const [result] = await pool.query(
      'INSERT INTO reclamaciones (usuario_id, tipo, descripcion, estado) VALUES (?, ?, ?, ?)',
      [usuario_id, tipo, descripcion, estado || 'pendiente']
    );
    
    res.status(201).json({ 
      message: 'Reclamación creada exitosamente', 
      id: result.insertId 
    });
  } catch (error) {
    console.error('Error creating reclamación:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

app.put('/admin/reclamaciones/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { usuario_id, tipo, descripcion, estado } = req.body;
    
    if (!usuario_id || !tipo || !descripcion) {
      return res.status(400).json({ error: 'Usuario, tipo y descripción son requeridos' });
    }

    const [result] = await pool.query(
      'UPDATE reclamaciones SET usuario_id = ?, tipo = ?, descripcion = ?, estado = ? WHERE id = ?',
      [usuario_id, tipo, descripcion, estado || 'pendiente', id]
    );
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Reclamación no encontrada' });
    }
    
    res.json({ message: 'Reclamación actualizada exitosamente' });
  } catch (error) {
    console.error('Error updating reclamación:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

app.delete('/admin/reclamaciones/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    
    const [result] = await pool.query('DELETE FROM reclamaciones WHERE id = ?', [id]);
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Reclamación no encontrada' });
    }
    
    res.json({ message: 'Reclamación eliminada exitosamente' });
  } catch (error) {
    console.error('Error deleting reclamación:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Dashboard stats endpoint
app.get('/admin/dashboard', authenticateToken, async (req, res) => {
  try {
    const [
      [users],
      [certificados],
      [cursos],
      [programas],
      [matriculas],
      [docentes],
      [reclamaciones]
    ] = await Promise.all([
      pool.query('SELECT COUNT(*) as count FROM users'),
      pool.query('SELECT COUNT(*) as count FROM certificados WHERE activo = 1'),
      pool.query('SELECT COUNT(*) as count FROM cursos'),
      pool.query('SELECT COUNT(*) as count FROM programas'),
      pool.query('SELECT COUNT(*) as count FROM matriculas'),
      pool.query('SELECT COUNT(*) as count FROM docentes'),
      pool.query('SELECT COUNT(*) as count FROM reclamaciones')
    ]);

    res.json({
      totalUsuarios: users.count || 0,
      totalCertificados: certificados.count || 0,
      totalCursos: cursos.count || 0,
      totalProgramas: programas.count || 0,
      totalMatriculas: matriculas.count || 0,
      totalDocentes: docentes.count || 0,
      totalReclamaciones: reclamaciones.count || 0
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    res.json({
      totalUsuarios: 0,
      totalCertificados: 0,
      totalCursos: 0,
      totalProgramas: 0,
      totalMatriculas: 0,
      totalDocentes: 0,
      totalReclamaciones: 0
    });
  }
});


// Verificar certificado por código
app.post('/admin/certificados/verificar', async (req, res) => {
  try {
    const { codigo } = req.body;

    if (!codigo) {
      return res.status(400).json({ 
        success: false, 
        message: 'Código de verificación requerido' 
      });
    }

    const [rows] = await pool.query(`
      SELECT * FROM certificados 
      WHERE codigo_verificacion = ? AND activo = 1
    `, [codigo]);

    if (rows.length === 0) {
      return res.json({ 
        success: false, 
        message: 'Certificado no encontrado o inválido' 
      });
    }

    const cert = rows[0];
    res.json({
      success: true,
      certificado: {
        nombre_completo: cert.nombre_completo,
        tipo_certificado: cert.tipo_certificado,
        nombre_evento: cert.nombre_evento,
        periodo_evento: formatearPeriodo(cert.fecha_inicio, cert.fecha_fin),
        horas_academicas: cert.horas_academicas,
        fecha_emision: formatearFechaEmision(cert.fecha_emision),
        codigo_verificacion: cert.codigo_verificacion
      }
    });
  } catch (error) {
    console.error('Error verifying certificado:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error interno del servidor' 
    });
  }
});

// Funciones auxiliares para certificados
function formatearPeriodo(fechaInicio, fechaFin) {
  const inicio = new Date(fechaInicio).toLocaleDateString('es-ES');
  const fin = new Date(fechaFin).toLocaleDateString('es-ES');
  
  if (inicio === fin) {
    return inicio;
  }
  
  return `del ${inicio} al ${fin}`;
}

function formatearFechaEmision(fecha) {
  const meses = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];
  
  const fechaObj = new Date(fecha);
  return `Puno, ${fechaObj.getDate()} de ${meses[fechaObj.getMonth()]} del año ${fechaObj.getFullYear()}.`;
}

// 2. Usar el middleware de manejo de errores.
// ¡Debe ser el último middleware que se añade!
app.use(errorHandler);

app.listen(port, () => {
  console.log(`New admin backend listening at http://localhost:${port}`);
});
// ==== Helper para columnas existentes en tablas (cache simple) ====
let cursosColumnsCache = null;
async function getCursosColumns() {
  if (cursosColumnsCache) return cursosColumnsCache;
  const [rows] = await pool.query(
    `SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS 
     WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'cursos'`
  );
  cursosColumnsCache = new Set(rows.map(r => r.COLUMN_NAME));
  return cursosColumnsCache;
}

async function hasCursosColumn(columnName) {
  const cols = await getCursosColumns();
  return cols.has(columnName);
}
