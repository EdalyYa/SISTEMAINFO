/**
 * Observa un archivo JSON y aplica sus cambios a la columna `configuracion`
 * del diseño activo (o del ID indicado) automáticamente.
 *
 * Uso:
 *   node backend/scripts/watch_apply_config.js --file=uploads/certificados/plantillas/config_certiinfo.json
 *   node backend/scripts/watch_apply_config.js --id=3 --file=uploads/certificados/plantillas/config_certiinfo.json
 */
const path = require('path');
const fs = require('fs');
const db = require('../database/connection');

function parseArgs() {
  const args = process.argv.slice(2);
  const out = {};
  for (const a of args) {
    const m = a.match(/^--([^=]+)=(.+)$/);
    if (m) out[m[1]] = m[2];
  }
  return out;
}

async function getTargetDesign(idFromArgs) {
  if (idFromArgs) {
    const [rows] = await db.execute('SELECT id, nombre, configuracion, activa FROM disenos_certificados WHERE id = ?', [idFromArgs]);
    if (!rows.length) throw new Error(`No existe diseño con id=${idFromArgs}`);
    return rows[0];
  }
  const [activeRows] = await db.execute(
    'SELECT id, nombre, configuracion, activa FROM disenos_certificados WHERE activa = 1 ORDER BY updated_at DESC LIMIT 1'
  );
  if (activeRows && activeRows.length) return activeRows[0];
  const [latestRows] = await db.execute(
    'SELECT id, nombre, configuracion, activa FROM disenos_certificados ORDER BY updated_at DESC LIMIT 1'
  );
  if (!latestRows.length) throw new Error('No hay diseños de certificados registrados');
  return latestRows[0];
}

function resolveFile(fileArg) {
  if (!fileArg) throw new Error('Debe especificar --file=RUTA_DEL_JSON');
  const baseDir = path.join(__dirname, '..');
  const resolved = path.isAbsolute(fileArg) ? fileArg : path.join(baseDir, fileArg);
  return resolved;
}

function readJson(filePath) {
  const raw = fs.readFileSync(filePath, 'utf8');
  return JSON.parse(raw);
}

async function applyConfig(designId, configJson) {
  await db.execute('UPDATE disenos_certificados SET configuracion = ?, updated_at = NOW() WHERE id = ?', [JSON.stringify(configJson), designId]);
}

async function main() {
  const args = parseArgs();
  const filePath = resolveFile(args.file);
  let design;
  try {
    design = await getTargetDesign(args.id);
  } catch (e) {
    console.error('❌ Error al obtener diseño destino:', e.message);
    process.exit(1);
  }

  console.log(`👀 Observando cambios en: ${filePath}`);
  console.log(`   Diseño destino: id=${design.id} nombre="${design.nombre}" activa=${design.activa ? 1 : 0}`);

  // Aplicar una vez al inicio si el archivo existe
  if (fs.existsSync(filePath)) {
    try {
      const cfg = readJson(filePath);
      await applyConfig(design.id, cfg);
      console.log('✅ Configuración aplicada al inicio');
    } catch (e) {
      console.warn('⚠️ No se pudo aplicar al inicio:', e.message);
    }
  } else {
    console.warn('⚠️ El archivo no existe aún, esperando a que se cree...');
  }

  // Debounce para evitar múltiples eventos por un mismo guardado
  let timer = null;
  const triggerUpdate = async () => {
    clearTimeout(timer);
    timer = setTimeout(async () => {
      try {
        if (!fs.existsSync(filePath)) {
          console.warn('⚠️ Archivo no encontrado en cambio, se omite');
          return;
        }
        const cfg = readJson(filePath);
        await applyConfig(design.id, cfg);
        console.log(`🔄 Aplicado ${new Date().toLocaleTimeString()} (claves: ${Object.keys(cfg).join(', ') || '(vacío)'})`);
      } catch (e) {
        console.error('❌ Error aplicando cambios:', e.message);
      }
    }, 200);
  };

  // fs.watch: simple y sin dependencias
  try {
    fs.watch(filePath, { persistent: true }, (eventType) => {
      if (eventType === 'change' || eventType === 'rename') {
        triggerUpdate();
      }
    });
  } catch (e) {
    console.error('❌ Error iniciando watcher:', e.message);
    process.exit(1);
  }

  // Cierre graceful
  const stop = async () => {
    try { await db.closePool(); } catch {}
    process.exit(0);
  };
  process.on('SIGINT', stop);
  process.on('SIGTERM', stop);
}

main();

