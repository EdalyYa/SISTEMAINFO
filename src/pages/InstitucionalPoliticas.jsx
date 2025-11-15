import React from 'react';
import { Link } from 'react-router-dom';
import { FaUniversity, FaFileAlt, FaInfoCircle, FaExternalLinkAlt, FaShieldAlt, FaCertificate, FaMicrochip } from 'react-icons/fa';
import { Card, CardHeader, CardTitle, CardContent, Button } from '../components/ui';

function InstitucionalPoliticas() {
  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-white to-blue-50 border border-blue-100 p-5 mb-6">
        <div className="text-center">
          <div className="inline-flex items-center gap-2 mb-1">
            <FaMicrochip className="text-blue-700" />
            <h1 className="text-2xl md:text-3xl font-bold text-blue-900">Políticas y Reglamentos − Instituto de Informática INFOUNA</h1>
          </div>
          <p className="text-gray-700 text-sm md:text-base font-mono">Lineamientos internos del Instituto de Informática INFOUNA y referencias a normativa institucional de la Universidad Nacional del Altiplano (UNAP).</p>
          <div className="mt-2 flex flex-wrap justify-center gap-2">
            <span className="inline-flex px-2.5 py-1 text-[11px] font-mono font-semibold rounded-full bg-blue-50 text-blue-700 ring-1 ring-blue-200">INFO-TECH</span>
            <span className="inline-flex px-2.5 py-1 text-[11px] font-semibold rounded-full bg-blue-100 text-blue-800">Instituto de Informática</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="rounded-xl hover:shadow-md transition">
          <div className="h-1 bg-gradient-to-r from-blue-700 via-cyan-600 to-indigo-700"></div>
          <CardHeader className="flex items-center gap-2">
            <FaInfoCircle className="text-blue-600" />
            <CardTitle className="text-blue-900">INFOUNA − Políticas internas</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-700 font-mono">Lineamientos y documentos del Instituto de Informática INFOUNA.</p>
            <Button variant="secondary" size="sm" rightIcon={FaExternalLinkAlt} onClick={() => window.open('https://infouna.unap.edu.pe/','_blank','noopener')}>infouna.unap.edu.pe</Button>
          </CardContent>
        </Card>

        <Card className="rounded-xl hover:shadow-md transition">
          <div className="h-1 bg-gradient-to-r from-blue-700 via-cyan-600 to-indigo-700"></div>
          <CardHeader className="flex items-center gap-2">
            <FaFileAlt className="text-indigo-600" />
            <CardTitle className="text-blue-900">INFOUNA − Transparencia</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-700 font-mono">Recursos institucionales relacionados a transparencia del Instituto.</p>
            <Link to="/institucional/transparencia"><Button variant="outline" size="sm" rightIcon={FaExternalLinkAlt}>Ver transparencia INFOUNA</Button></Link>
          </CardContent>
        </Card>

        <Card className="rounded-xl hover:shadow-md transition">
          <div className="h-1 bg-gradient-to-r from-blue-700 via-cyan-600 to-indigo-700"></div>
          <CardHeader className="flex items-center gap-2">
            <FaShieldAlt className="text-blue-600" />
            <CardTitle className="text-blue-900">INFOUNA − Acreditación</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-700 font-mono">Estándares de calidad y procesos vinculados a INFOUNA.</p>
            <Link to="/institucional/acreditacion"><Button variant="primary" size="sm" rightIcon={FaExternalLinkAlt}>Ver acreditación INFOUNA</Button></Link>
          </CardContent>
        </Card>

        <Card className="rounded-xl hover:shadow-md transition">
          <div className="h-1 bg-gradient-to-r from-blue-700 via-cyan-600 to-indigo-700"></div>
          <CardHeader className="flex items-center gap-2">
            <FaCertificate className="text-emerald-600" />
            <CardTitle className="text-blue-900">INFOUNA − Certificados</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-700 font-mono">Verificación pública de certificados emitidos por INFOUNA.</p>
            <Link to="/certificados"><Button variant="success" size="sm" rightIcon={FaExternalLinkAlt}>Verificar certificados</Button></Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default InstitucionalPoliticas;
