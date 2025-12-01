import React from 'react';
import { Link } from 'react-router-dom';
import { FaUniversity, FaFileAlt, FaInfoCircle, FaExternalLinkAlt, FaShieldAlt, FaCertificate } from 'react-icons/fa';
import { Card, CardHeader, CardTitle, CardContent, Button } from '../components/ui';

function InstitucionalPoliticas() {
  return (
    <div className="bg-gradient-to-b from-gray-50 to-white">
      <div className="relative mb-4 md:mb-6">
        <div className="mx-auto max-w-6xl">
          <div className="relative rounded-3xl bg-blue-50 border border-blue-100 p-6 shadow-sm overflow-hidden">
            <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(59,130,246,0.12)_1px,transparent_1px),linear-gradient(to_bottom,rgba(59,130,246,0.12)_1px,transparent_1px)] [background-size:22px_22px] opacity-50 pointer-events-none"></div>
            <div className="relative text-center">
              <div className="inline-flex items-center gap-2 mb-1 justify-center">
                <h1 className="text-3xl md:text-4xl font-bold text-gray-900">Políticas y Reglamentos − Instituto de Informática INFOUNA</h1>
              </div>
              <p className="text-base md:text-xl text-gray-600 max-w-3xl mx-auto">Lineamientos internos del Instituto de Informática INFOUNA y referencias a normativa institucional de la Universidad Nacional del Altiplano (UNAP).</p>
              <div className="mt-2 flex flex-wrap justify-center gap-2">
                <span className="inline-flex px-2.5 py-1 text-[11px] font-medium rounded-full bg-blue-100 text-blue-800">Instituto de Informática</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
          <Card className="rounded-xl hover:shadow-md transition">
            <div className="h-1 bg-gradient-to-r from-blue-700 via-cyan-600 to-indigo-700"></div>
            <CardHeader className="flex items-center gap-2">
              <FaInfoCircle className="text-blue-600" />
              <CardTitle className="text-blue-900 text-lg md:text-xl font-bold">INFOUNA − Políticas internas</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm md:text-base text-gray-700 leading-relaxed">Lineamientos y documentos del Instituto de Informática INFOUNA.</p>
              <div className="mt-2 flex flex-wrap gap-2">
                <span className="inline-flex px-2.5 py-1 text-[11px] font-medium rounded-full bg-indigo-50 text-indigo-800 ring-1 ring-indigo-200">Documentos</span>
                <span className="inline-flex px-2.5 py-1 text-[11px] font-medium rounded-full bg-blue-50 text-blue-800 ring-1 ring-blue-200">Lineamientos</span>
              </div>
              <Button variant="secondary" size="sm" rightIcon={FaExternalLinkAlt} onClick={() => window.open('https://infouna.unap.edu.pe/','_blank','noopener')}>infouna.unap.edu.pe</Button>
            </CardContent>
          </Card>

          <Card className="rounded-xl hover:shadow-md transition">
            <div className="h-1 bg-gradient-to-r from-blue-700 via-cyan-600 to-indigo-700"></div>
            <CardHeader className="flex items-center gap-2">
              <FaFileAlt className="text-indigo-600" />
              <CardTitle className="text-blue-900 text-lg md:text-xl font-bold">INFOUNA − Transparencia</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm md:text-base text-gray-700 leading-relaxed">Recursos institucionales relacionados a transparencia del Instituto.</p>
              <div className="mt-2 flex flex-wrap gap-2">
                <span className="inline-flex px-2.5 py-1 text-[11px] font-medium rounded-full bg-blue-50 text-blue-800 ring-1 ring-blue-200">Transparencia</span>
                <span className="inline-flex px-2.5 py-1 text-[11px] font-medium rounded-full bg-emerald-50 text-emerald-800 ring-1 ring-emerald-200">INFOUNA</span>
              </div>
              <Link to="/institucional/transparencia"><Button variant="outline" size="sm" rightIcon={FaExternalLinkAlt}>Ver transparencia INFOUNA</Button></Link>
            </CardContent>
          </Card>

          <Card className="rounded-xl hover:shadow-md transition">
            <div className="h-1 bg-gradient-to-r from-blue-700 via-cyan-600 to-indigo-700"></div>
            <CardHeader className="flex items-center gap-2">
              <FaShieldAlt className="text-blue-600" />
              <CardTitle className="text-blue-900 text-lg md:text-xl font-bold">INFOUNA − Acreditación</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm md:text-base text-gray-700 leading-relaxed">Estándares de calidad y procesos vinculados a INFOUNA.</p>
              <div className="mt-2 flex flex-wrap gap-2">
                <span className="inline-flex px-2.5 py-1 text-[11px] font-medium rounded-full bg-amber-50 text-amber-800 ring-1 ring-amber-200">Calidad</span>
                <span className="inline-flex px-2.5 py-1 text-[11px] font-medium rounded-full bg-slate-50 text-slate-800 ring-1 ring-slate-200">SINEACE</span>
              </div>
              <Link to="/institucional/acreditacion"><Button variant="primary" size="sm" rightIcon={FaExternalLinkAlt}>Ver acreditación INFOUNA</Button></Link>
            </CardContent>
          </Card>

          <Card className="rounded-xl hover:shadow-md transition">
            <div className="h-1 bg-gradient-to-r from-blue-700 via-cyan-600 to-indigo-700"></div>
            <CardHeader className="flex items-center gap-2">
              <FaCertificate className="text-emerald-600" />
              <CardTitle className="text-blue-900 text-lg md:text-xl font-bold">INFOUNA − Certificados</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm md:text-base text-gray-700 leading-relaxed">Verificación pública de certificados emitidos por INFOUNA.</p>
              <div className="mt-2 flex flex-wrap gap-2">
                <span className="inline-flex px-2.5 py-1 text-[11px] font-medium rounded-full bg-emerald-50 text-emerald-800 ring-1 ring-emerald-200">Verificación</span>
                <span className="inline-flex px-2.5 py-1 text-[11px] font-medium rounded-full bg-blue-50 text-blue-800 ring-1 ring-blue-200">Pública</span>
              </div>
              <Link to="/certificados"><Button variant="success" size="sm" rightIcon={FaExternalLinkAlt}>Verificar certificados</Button></Link>
            </CardContent>
          </Card>
        </div>

        <Card className="rounded-xl hover:shadow-md transition mt-4">
          <div className="h-1 bg-gradient-to-r from-slate-700 via-blue-700 to-slate-800"></div>
          <CardHeader className="flex items-center gap-2">
            <FaUniversity className="text-slate-700" />
            <CardTitle className="text-blue-900 text-lg md:text-xl font-bold">Referencias externas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" size="sm" rightIcon={FaExternalLinkAlt} onClick={() => window.open('https://transparencia.unap.edu.pe/web/','_blank','noopener')}>Transparencia UNAP</Button>
              <Button variant="secondary" size="sm" rightIcon={FaExternalLinkAlt} onClick={() => window.open('https://www.transparencia.gob.pe/','_blank','noopener')}>Portal Nacional de Transparencia</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default InstitucionalPoliticas;
