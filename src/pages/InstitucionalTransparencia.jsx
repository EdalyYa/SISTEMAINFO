import React from 'react';
import { Link } from 'react-router-dom';
import { FaUniversity, FaExternalLinkAlt, FaShieldAlt, FaInfoCircle, FaFileAlt, FaCertificate, FaMicrochip } from 'react-icons/fa';
import { Card, CardHeader, CardTitle, CardContent, Button } from '../components/ui';

function InstitucionalTransparencia() {
  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="relative mb-6">
        <div className="mx-auto max-w-6xl">
          <div className="rounded-3xl bg-blue-50 border border-blue-100 p-5 shadow-sm">
            <div className="text-center">
              <div className="inline-flex items-center gap-2 mb-1">
                <FaMicrochip className="text-blue-700" />
                <h1 className="text-2xl md:text-3xl font-bold text-blue-900">Transparencia − Instituto de Informática INFOUNA</h1>
              </div>
              <p className="text-gray-700 text-sm md:text-base font-mono">Accede a recursos institucionales del Instituto de Informática INFOUNA. Referencias externas se listan al final.</p>
              <div className="mt-2 flex flex-wrap justify-center gap-2">
                <span className="inline-flex px-2.5 py-1 text-[11px] font-mono font-semibold rounded-full bg-blue-50 text-blue-700 ring-1 ring-blue-200">INFO-TECH</span>
                <span className="inline-flex px-2.5 py-1 text-[11px] font-semibold rounded-full bg-blue-100 text-blue-800">Instituto de Informática</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="rounded-xl hover:shadow-md transition">
          <div className="h-1 bg-gradient-to-r from-blue-700 via-cyan-600 to-indigo-700"></div>
          <CardHeader className="flex items-center gap-2">
            <span className="inline-block w-2 h-2 rounded-full bg-blue-600" aria-hidden="true"></span>
            <FaInfoCircle className="text-blue-600" />
            <CardTitle className="text-blue-900">INFOUNA − Sitio institucional</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-700 font-mono">Programas, cursos, avisos y contacto del Instituto de Informática INFOUNA.</p>
            <Button variant="outline" size="sm" rightIcon={FaExternalLinkAlt} onClick={() => window.open('https://infouna.unap.edu.pe/','_blank','noopener')}>infouna.unap.edu.pe</Button>
          </CardContent>
        </Card>

        <Card className="rounded-xl hover:shadow-md transition">
          <div className="h-1 bg-gradient-to-r from-blue-700 via-cyan-600 to-indigo-700"></div>
          <CardHeader className="flex items-center gap-2">
            <span className="inline-block w-2 h-2 rounded-full bg-indigo-600" aria-hidden="true"></span>
            <FaFileAlt className="text-indigo-600" />
            <CardTitle className="text-blue-900">INFOUNA − Documentos y políticas</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-700 font-mono">Políticas internas, lineamientos y documentos del Instituto de Informática.</p>
            <Link to="/institucional/politicas"><Button variant="secondary" size="sm" rightIcon={FaExternalLinkAlt}>Ver políticas INFOUNA</Button></Link>
          </CardContent>
        </Card>

        <Card className="rounded-xl hover:shadow-md transition">
          <div className="h-1 bg-gradient-to-r from-blue-700 via-cyan-600 to-indigo-700"></div>
          <CardHeader className="flex items-center gap-2">
            <span className="inline-block w-2 h-2 rounded-full bg-blue-600" aria-hidden="true"></span>
            <FaCertificate className="text-blue-600" />
            <CardTitle className="text-blue-900">INFOUNA − Acreditación</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-700 font-mono">Información de referencia vinculada a calidad y acreditación.</p>
            <Link to="/institucional/acreditacion"><Button variant="primary" size="sm" rightIcon={FaExternalLinkAlt}>Ver acreditación INFOUNA</Button></Link>
          </CardContent>
        </Card>

        <Card className="rounded-xl hover:shadow-md transition">
          <div className="h-1 bg-gradient-to-r from-blue-700 via-cyan-600 to-indigo-700"></div>
          <CardHeader className="flex items-center gap-2">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-600" aria-hidden="true"></span>
            <FaCertificate className="text-emerald-600" />
            <CardTitle className="text-blue-900">INFOUNA − Certificados</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-700 font-mono">Verificación pública de certificados emitidos por INFOUNA.</p>
            <Link to="/certificados"><Button variant="success" size="sm" rightIcon={FaExternalLinkAlt}>Verificar certificados INFOUNA</Button></Link>
          </CardContent>
        </Card>
      </div>

      <div className="mt-8 text-xs text-gray-500">
        Referencias externas:
        <a className="ml-2 text-blue-700 hover:underline" href="https://transparencia.unap.edu.pe/web/" target="_blank" rel="noreferrer">Transparencia UNAP</a>
        <span className="mx-1">·</span>
        <a className="text-indigo-700 hover:underline" href="https://www.transparencia.gob.pe/" target="_blank" rel="noreferrer">Portal Nacional de Transparencia</a>
      </div>
    </div>
  );
}

export default InstitucionalTransparencia;
