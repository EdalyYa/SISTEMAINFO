import React, { useEffect } from 'react';

function TuitionModal({ isOpen, onClose, program }) {
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleEnrollClick = () => {
    window.open('https://matriculas.infouna.unap.edu.pe/login', '_blank');
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-blue-900">Tasas INFOUNA y Métodos de Pago</h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 text-2xl"
              aria-label="Cerrar modal"
            >
              &times;
            </button>
          </div>

          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-blue-800 mb-3">Costos de Programas INFOUNA</h3>
              <div className="bg-gray-50 p-4 rounded">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="font-medium">Matrícula:</p>
                    <p className="text-green-600">S/ 150.00</p>
                  </div>
                  <div>
                    <p className="font-medium">Mensualidad:</p>
                    <p className="text-green-600">S/ 250.00</p>
                  </div>
                  <div>
                    <p className="font-medium">Certificación:</p>
                    <p className="text-green-600">S/ 100.00</p>
                  </div>
                  <div>
                    <p className="font-medium">Materiales:</p>
                    <p className="text-green-600">S/ 50.00</p>
                  </div>
                </div>
                <div className="mt-4 p-3 bg-blue-100 rounded">
                  <p className="text-blue-800 font-medium">Total referencial INFOUNA: S/ 550.00</p>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-blue-800 mb-3">Métodos de Pago INFOUNA</h3>
              <div className="space-y-3">
                <div className="flex items-center p-3 bg-gray-50 rounded">
                  <div className="w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center mr-3">
                    <span className="text-white font-bold">B</span>
                  </div>
                  <div>
                    <p className="font-medium">Transferencia Bancaria</p>
                    <p className="text-sm text-gray-600">BCP INFOUNA: 123-456789-0-12</p>
                  </div>
                </div>
                <div className="flex items-center p-3 bg-gray-50 rounded">
                  <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center mr-3">
                    <span className="text-white font-bold">Y</span>
                  </div>
                  <div>
                    <p className="font-medium">Yape / Plin</p>
                    <p className="text-sm text-gray-600">970 709 787</p>
                  </div>
                </div>
                <div className="flex items-center p-3 bg-gray-50 rounded">
                  <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center mr-3">
                    <span className="text-white font-bold">E</span>
                  </div>
                  <div>
                    <p className="font-medium">Efectivo</p>
                    <p className="text-sm text-gray-600">En nuestras oficinas</p>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-blue-800 mb-3">Ubicación</h3>
              <p className="text-gray-700">
                Edificio de 15 pisos 7mo piso - Ciudad Universitaria, Puno<br />
                Puerta Nro. 3 de la Universidad Nacional del Altiplano<br />
                Horario de atención: Lunes a Viernes 8:00 AM - 6:00 PM
              </p>
            </div>

            <div className="flex space-x-4 pt-4">
              <button
                onClick={handleEnrollClick}
                className="flex-1 bg-yellow-400 text-black px-6 py-3 rounded-lg font-semibold hover:bg-yellow-300 transition"
              >
                Matricúlate ya!
              </button>
              <button
                onClick={onClose}
                className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 transition"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default TuitionModal;
