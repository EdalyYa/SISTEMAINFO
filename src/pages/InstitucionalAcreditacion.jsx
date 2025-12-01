import React from 'react';
import { Link } from 'react-router-dom';
import { FaUniversity, FaShieldAlt, FaNewspaper, FaGraduationCap, FaExternalLinkAlt } from 'react-icons/fa';
import { Card, CardHeader, CardTitle, CardContent, Button } from '../components/ui';

function InstitucionalAcreditacion() {
  return (
    <div className="bg-gradient-to-b from-gray-50 to-white">
      <div className="relative mb-4 md:mb-6">
        <div className="mx-auto max-w-6xl">
          <div className="relative rounded-3xl bg-blue-50 border border-blue-100 p-6 shadow-sm overflow-hidden">
            <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(59,130,246,0.12)_1px,transparent_1px),linear-gradient(to_bottom,rgba(59,130,246,0.12)_1px,transparent_1px)] [background-size:22px_22px] opacity-50 pointer-events-none"></div>
            <div className="relative text-center px-4 py-1">
              <div className="inline-flex items-center gap-2 mb-1 justify-center">
                <h1 className="text-3xl md:text-4xl font-bold text-gray-900">Acreditación − Instituto de Informática INFOUNA</h1>
              </div>
              <p className="text-gray-600 text-base md:text-xl max-w-3xl mx-auto">Información de referencia sobre estándares de calidad y procesos de acreditación asociados a los programas del Instituto de Informática INFOUNA. En el Perú, la acreditación es gestionada por SINEACE.</p>
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
              <span className="inline-block w-2 h-2 rounded-full bg-blue-600" aria-hidden="true"></span>
              <FaShieldAlt className="text-blue-600" />
              <CardTitle className="text-blue-900 text-lg md:text-xl font-bold">SINEACE − Información oficial</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm md:text-base text-gray-700 leading-relaxed">Marco de acreditación, estándares de calidad, normativa y búsqueda de programas acreditados.</p>
              <div className="mt-2 flex flex-wrap gap-2">
                <span className="inline-flex px-2.5 py-1 text-[11px] font-medium rounded-full bg-amber-50 text-amber-800 ring-1 ring-amber-200">Calidad</span>
                <span className="inline-flex px-2.5 py-1 text-[11px] font-medium rounded-full bg-blue-50 text-blue-800 ring-1 ring-blue-200">Marco</span>
                <span className="inline-flex px-2.5 py-1 text-[11px] font-medium rounded-full bg-emerald-50 text-emerald-800 ring-1 ring-emerald-200">Programas acreditados</span>
              </div>
              <Button variant="outline" size="sm" rightIcon={FaExternalLinkAlt} onClick={() => window.open('https://www.sineace.gob.pe/','_blank','noopener')}>sineace.gob.pe</Button>
            </CardContent>
          </Card>

          <Card className="rounded-xl hover:shadow-md transition">
            <div className="h-1 bg-gradient-to-r from-blue-700 via-cyan-600 to-indigo-700"></div>
            <CardHeader className="flex items-center gap-2">
              <span className="inline-block w-2 h-2 rounded-full bg-indigo-600" aria-hidden="true"></span>
              <FaNewspaper className="text-indigo-600" />
              <CardTitle className="text-blue-900 text-lg md:text-xl font-bold">INFOUNA − Comunicados y avisos</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm md:text-base text-gray-700 leading-relaxed">Publicaciones y avisos institucionales del Instituto de Informática INFOUNA.</p>
              <div className="mt-2 flex flex-wrap gap-2">
                <span className="inline-flex px-2.5 py-1 text-[11px] font-medium rounded-full bg-indigo-50 text-indigo-800 ring-1 ring-indigo-200">Avisos</span>
                <span className="inline-flex px-2.5 py-1 text-[11px] font-medium rounded-full bg-blue-50 text-blue-800 ring-1 ring-blue-200">INFOUNA</span>
              </div>
              <Button variant="secondary" size="sm" rightIcon={FaExternalLinkAlt} onClick={() => window.open('https://infouna.unap.edu.pe/','_blank','noopener')}>infouna.unap.edu.pe</Button>
            </CardContent>
          </Card>

          <Card className="rounded-xl hover:shadow-md transition">
            <div className="h-1 bg-gradient-to-r from-blue-700 via-cyan-600 to-indigo-700"></div>
            <CardHeader className="flex items-center gap-2">
              <span className="inline-block w-2 h-2 rounded-full bg-blue-600" aria-hidden="true"></span>
              <FaGraduationCap className="text-blue-600" />
              <CardTitle className="text-blue-900 text-lg md:text-xl font-bold">INFOUNA − Programas y certificaciones</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm md:text-base text-gray-700 leading-relaxed">Consulta los programas y cursos del Instituto de Informática INFOUNA.</p>
              <div className="mt-2 flex flex-wrap gap-2">
                <span className="inline-flex px-2.5 py-1 text-[11px] font-medium rounded-full bg-emerald-50 text-emerald-800 ring-1 ring-emerald-200">Formación</span>
                <span className="inline-flex px-2.5 py-1 text-[11px] font-medium rounded-full bg-blue-50 text-blue-800 ring-1 ring-blue-200">Certificación</span>
              </div>
              <Link to="/programas"><Button variant="primary" size="sm" rightIcon={FaExternalLinkAlt}>Ver programas INFOUNA</Button></Link>
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
              <Button variant="outline" size="sm" rightIcon={FaExternalLinkAlt} onClick={() => window.open('https://www.sineace.gob.pe/','_blank','noopener')}>SINEACE</Button>
              <Button variant="secondary" size="sm" rightIcon={FaExternalLinkAlt} onClick={() => window.open('https://transparencia.unap.edu.pe/web/','_blank','noopener')}>Transparencia UNAP</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default InstitucionalAcreditacion;
