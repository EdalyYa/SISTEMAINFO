import React from 'react';
import { Modal, Button } from './ui';
import { AlertCircle, Clock, Info } from 'lucide-react';

const RecommendationsModal = ({ isOpen, onClose, horarioLabel }) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={null}
      size="md"
      showCloseButton={false}
      preventScroll={true}
    >
      <div className="text-center">
        <div className="text-green-600 text-2xl font-extrabold mb-2">¡Atención!</div>
        <p className="text-sm text-gray-600 mb-4">
          Ten en cuenta estas recomendaciones para solicitar y validar tu certificado.
        </p>
      </div>

      <div className="space-y-2 text-sm text-gray-700">
        <ol className="list-decimal list-inside space-y-1">
          <li>Usa tu código tal como aparece en el certificado.</li>
          <li>Evita tildes y escribe en mayúsculas.</li>
          <li>Si el colegio/institución no está habilitado, comunícate con nosotros.</li>
          <li>Para certificados antiguos, puedes requerir emisión presencial.</li>
          <li>Anota tu código de verificación y guárdalo en lugar seguro.</li>
          <li>Ante errores, usa la opción "Anular" o contáctanos.</li>
          <li>El PDF se descarga automáticamente; no cierres el navegador.</li>
          <li>Consulta dudas en: <a className="text-blue-600 underline" href="mailto:info@infouna.edu.pe">info@infouna.edu.pe</a></li>
        </ol>
        {horarioLabel && (
          <div className="mt-3 flex items-center gap-2 p-2 rounded bg-blue-50 border border-blue-100 text-blue-800">
            <Clock className="w-4 h-4" />
            <span className="text-xs">Horario de atención: {horarioLabel}</span>
          </div>
        )}
      </div>

      <div className="mt-6 flex justify-end">
        <Button onClick={onClose} variant="primary">Aceptar</Button>
      </div>
    </Modal>
  );
};

export default RecommendationsModal;
