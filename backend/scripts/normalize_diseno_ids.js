/**
 * Normaliza campos de diseño en la tabla `certificados`.
 * - Rellena `diseno_id` extrayéndolo de `plantilla_certificado` si sigue el patrón `diseno_<ID>.<ext>`.
 * - Unifica `plantilla_certificado` a `.pdf` cuando exista `diseno_id` y la plantilla esté en `.svg`.
 *
 * Uso:
 *   node backend/scripts/normalize_diseno_ids.js            # ejecución normal
 *   DRY_RUN=true node backend/scripts/normalize_diseno_ids.js  # solo muestra conteos, no actualiza
 */

const { pool } = require('../config/database');

async function run() {
  const dryRun = String(process.env.DRY_RUN || 'false').toLowerCase() === 'true';
  const conn = await pool.getConnection();
  try {
    console.log('⏳ Iniciando normalización de diseños (dryRun=%s)', dryRun);

    // 1) Contar candidatos para rellenar diseno_id
    const [missingIdRows] = await conn.query(
      `SELECT COUNT(*) AS cnt
       FROM certificados
       WHERE diseno_id IS NULL AND plantilla_certificado LIKE 'diseno_%'`
    );
    const missingIdCount = missingIdRows[0]?.cnt || 0;
    console.log('• Certificados con diseno_id NULL y plantilla "diseno_%":', missingIdCount);

    // 2) Contar candidatos para convertir svg->pdf
    const [svgRows] = await conn.query(
      `SELECT COUNT(*) AS cnt
       FROM certificados
       WHERE diseno_id IS NOT NULL AND plantilla_certificado LIKE 'diseno_%.svg'`
    );
    const svgCount = svgRows[0]?.cnt || 0;
    console.log('• Certificados con plantilla SVG y diseno_id presente:', svgCount);

    if (dryRun) {
      console.log('🔎 DRY RUN: No se realizarán actualizaciones.');
      return;
    }

    // Ejecutar dentro de transacción
    await conn.beginTransaction();

    // 3) Rellenar diseno_id extrayendo de plantilla_certificado sin importar la extensión
    const [upd1] = await conn.query(
      `UPDATE certificados
       SET diseno_id = CAST(
         SUBSTRING_INDEX(SUBSTRING_INDEX(plantilla_certificado, '.', 1), 'diseno_', -1)
         AS UNSIGNED
       )
       WHERE diseno_id IS NULL AND plantilla_certificado LIKE 'diseno_%'`
    );
    console.log('✔ diseno_id actualizados:', upd1.affectedRows || 0);

    // 4) Unificar extensión de plantilla a .pdf cuando exista diseno_id
    const [upd2] = await conn.query(
      `UPDATE certificados
       SET plantilla_certificado = CONCAT('diseno_', diseno_id, '.pdf')
       WHERE diseno_id IS NOT NULL AND plantilla_certificado LIKE 'diseno_%.svg'`
    );
    console.log('✔ plantilla_certificado normalizados a .pdf:', upd2.affectedRows || 0);

    await conn.commit();
    console.log('✅ Normalización completada.');
  } catch (err) {
    try { await conn.rollback(); } catch {}
    console.error('❌ Error durante normalización:', err.message);
    process.exitCode = 1;
  } finally {
    try { conn.release(); } catch {}
  }
}

run();

