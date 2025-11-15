import React from 'react';
import { Link } from 'react-router-dom';
import { FaUniversity, FaShieldAlt, FaNewspaper, FaGraduationCap, FaExternalLinkAlt, FaMicrochip } from 'react-icons/fa';
import { Card, CardHeader, CardTitle, CardContent, Button } from '../components/ui';

function InstitucionalAcreditacion() {
  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="relative mb-6">
        <div className="rounded-3xl bg-blue-50 border border-blue-100 p-5 shadow-sm overflow-hidden">
          <div className="text-center px-4 py-1">
            <div className="inline-flex items-center gap-2 mb-1 justify-center">
              <FaMicrochip className="text-blue-700" />
              <h1 className="text-2xl md:text-3xl font-bold text-blue-900">Acreditación − Instituto de Informática INFOUNA</h1>
            </div>
            <p className="text-gray-700 text-sm md:text-base font-mono">Información de referencia sobre estándares de calidad y procesos de acreditación asociados a los programas del Instituto de Informática INFOUNA. En el Perú, la acreditación es gestionada por SINEACE.</p>
            <div className="mt-2 flex flex-wrap justify-center gap-2">
              <span className="inline-flex px-2.5 py-1 text-[11px] font-mono font-semibold rounded-full bg-blue-50 text-blue-700 ring-1 ring-blue-200">INFO-TECH</span>
              <span className="inline-flex px-2.5 py-1 text-[11px] font-semibold rounded-full bg-blue-100 text-blue-800">Instituto de Informática</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="rounded-xl hover:shadow-md transition">
          <div className="h-1 bg-gradient-to-r from-blue-700 via-cyan-600 to-indigo-700"></div>
          <CardHeader className="flex items-center gap-2">
            <span className="inline-block w-2 h-2 rounded-full bg-blue-600" aria-hidden="true"></span>
            <FaShieldAlt className="text-blue-600" />
            <CardTitle className="text-blue-900">SINEACE − Información oficial</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-700 font-mono">Marco de acreditación, estándares de calidad, normativa y búsqueda de programas acreditados.</p>
            <Button variant="outline" size="sm" rightIcon={FaExternalLinkAlt} onClick={() => window.open('https://www.sineace.gob.pe/','_blank','noopener')}>sineace.gob.pe</Button>
          </CardContent>
        </Card>

        <Card className="rounded-xl hover:shadow-md transition">
          <div className="h-1 bg-gradient-to-r from-blue-700 via-cyan-600 to-indigo-700"></div>
          <CardHeader className="flex items-center gap-2">
            <span className="inline-block w-2 h-2 rounded-full bg-indigo-600" aria-hidden="true"></span>
            <FaNewspaper className="text-indigo-600" />
            <CardTitle className="text-blue-900">INFOUNA − Comunicados y avisos</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-700 font-mono">Publicaciones y avisos institucionales del Instituto de Informática INFOUNA.</p>
            <Button variant="secondary" size="sm" rightIcon={FaExternalLinkAlt} onClick={() => window.open('https://infouna.unap.edu.pe/','_blank','noopener')}>infouna.unap.edu.pe</Button>
          </CardContent>
        </Card>

        <Card className="rounded-xl hover:shadow-md transition">
          <div className="h-1 bg-gradient-to-r from-blue-700 via-cyan-600 to-indigo-700"></div>
          <CardHeader className="flex items-center gap-2">
            <span className="inline-block w-2 h-2 rounded-full bg-blue-600" aria-hidden="true"></span>
            <FaGraduationCap className="text-blue-600" />
            <CardTitle className="text-blue-900">INFOUNA − Programas y certificaciones</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-700 font-mono">Consulta los programas y cursos del Instituto de Informática INFOUNA.</p>
            <Link to="/programas"><Button variant="primary" size="sm" rightIcon={FaExternalLinkAlt}>Ver programas INFOUNA</Button></Link>
          </CardContent>
        </Card>
      </div>

      <div className="mt-8 text-xs text-gray-500">Fuentes: SINEACE y portales institucionales UNAP (enlaces externos).</div>
    </div>
  );
}

export default InstitucionalAcreditacion;
