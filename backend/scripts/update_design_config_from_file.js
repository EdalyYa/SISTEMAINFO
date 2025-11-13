/**
 * Actualiza la configuración del diseño leyendo un JSON local.
 * - Si existen columnas nuevas, PRIORIZA escribir en `campos_json`.
 * - Si no existen, escribe en la columna antigua `configuracion`.
 * Uso:
 *   node backend/scripts/update_design_config_from_file.js --id=3 --file=uploads/certificados/plantillas/config.json
 *   node backend/scripts/update_design_config_from_file.js --file=uploads/certificados/plantillas/config.json  (usa el diseño activo)
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
  // Detectar si existen columnas nuevas
  let hasNewCols = false;
  try {
    const [cols] = await db.execute(`SELECT COLUMN_NAME FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'disenos_certificados' AND COLUMN_NAME IN ('campos_json','fondo_url','incluye_qr')`);
    hasNewCols = Array.isArray(cols) && cols.length >= 1;
  } catch (_) {}

  if (idFromArgs) {
    const [rows] = hasNewCols
      ? await db.execute('SELECT id, nombre, campos_json, fondo_url, incluye_qr, configuracion, fondo_certificado, activa FROM disenos_certificados WHERE id = ?', [idFromArgs])
      : await db.execute('SELECT id, nombre, configuracion, fondo_certificado, activa FROM disenos_certificados WHERE id = ?', [idFromArgs]);
    if (!rows.length) throw new Error(`No existe diseño con id=${idFromArgs}`);
    return rows[0];
  }
  // Preferir el marcado como activo
  const [activeRows] = hasNewCols
    ? await db.execute('SELECT id, nombre, campos_json, fondo_url, incluye_qr, configuracion, fondo_certificado, activa FROM disenos_certificados WHERE activa = 1 ORDER BY updated_at DESC LIMIT 1')
    : await db.execute('SELECT id, nombre, configuracion, fondo_certificado, activa FROM disenos_certificados WHERE activa = 1 ORDER BY updated_at DESC LIMIT 1');
  if (activeRows && activeRows.length) return activeRows[0];
  // Si no hay activo, tomar el más reciente
  const [latestRows] = hasNewCols
    ? await db.execute('SELECT id, nombre, campos_json, fondo_url, incluye_qr, configuracion, fondo_certificado, activa FROM disenos_certificados ORDER BY updated_at DESC LIMIT 1')
    : await db.execute('SELECT id, nombre, configuracion, fondo_certificado, activa FROM disenos_certificados ORDER BY updated_at DESC LIMIT 1');
  if (!latestRows.length) throw new Error('No hay diseños de certificados registrados');
  return latestRows[0];
}

function readJsonConfig(fileArg) {
  if (!fileArg) throw new Error('Debe especificar --file=RUTA_DEL_JSON');
  // Permitir rutas relativas desde el backend y absolutas
  const baseDir = path.join(__dirname, '..');
  const resolved = path.isAbsolute(fileArg)
    ? fileArg
    : path.join(baseDir, fileArg);

  if (!fs.existsSync(resolved)) {
    throw new Error(`No existe el archivo: ${resolved}`);
  }
  const raw = fs.readFileSync(resolved, 'utf8');
  try {
    const json = JSON.parse(raw);
    return json;
  } catch (e) {
    throw new Error(`JSON inválido en ${resolved}: ${e.message}`);
  }
}

async function updateDesignConfig(designId, configJson) {
  // Detectar columnas nuevas para escribir en la correcta
  let hasNewCols = false;
  try {
    const [cols] = await db.execute(`SELECT COLUMN_NAME FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'disenos_certificados' AND COLUMN_NAME IN ('campos_json')`);
    hasNewCols = Array.isArray(cols) && cols.length >= 1;
  } catch (_) {}

  const payload = JSON.stringify(configJson);
  if (hasNewCols) {
    await db.execute('UPDATE disenos_certificados SET campos_json = ?, updated_at = NOW() WHERE id = ?', [payload, designId]);
  } else {
    await db.execute('UPDATE disenos_certificados SET configuracion = ?, updated_at = NOW() WHERE id = ?', [payload, designId]);
  }
}

async function main() {
  try {
    const args = parseArgs();
    const target = await getTargetDesign(args.id);
    const config = readJsonConfig(args.file);

    await updateDesignConfig(target.id, config);

    const keys = Object.keys(config || {});
    console.log('✅ Configuración actualizada correctamente');
    console.log(`   Diseño: id=${target.id} nombre="${target.nombre}" activa=${target.activa ? 1 : 0}`);
    console.log(`   Archivo aplicado: ${args.file}`);
    console.log(`   Claves en configuración: ${keys.length ? keys.join(', ') : '(vacío)'}`);

    // Mostrar un resumen bonito
    // Mostrar JSON pretty: preferir campos_json si existe
    let hasNewCols = false;
    try {
      const [cols] = await db.execute(`SELECT COLUMN_NAME FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'disenos_certificados' AND COLUMN_NAME IN ('campos_json')`);
      hasNewCols = Array.isArray(cols) && cols.length >= 1;
    } catch (_) {}
    const [rows] = hasNewCols
      ? await db.execute('SELECT id, nombre, JSON_PRETTY(campos_json) as cfg, updated_at FROM disenos_certificados WHERE id = ?', [target.id])
      : await db.execute('SELECT id, nombre, JSON_PRETTY(configuracion) as cfg, updated_at FROM disenos_certificados WHERE id = ?', [target.id]);
    if (rows && rows[0]) {
      console.log('--- Configuración guardada (pretty) ---');
      console.log(rows[0].cfg);
    }
  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exitCode = 1;
  } finally {
    try { await db.closePool(); } catch {}
  }
}

main();
