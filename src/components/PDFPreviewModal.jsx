import React from 'react';
import { API_BASE } from '../config/api';
import { X, Download, Printer, FileText } from 'lucide-react';

const PDFPreviewModal = ({ isOpen, onClose, pdfUrl, certificateCode }) => {
  if (!isOpen) return null;

  const handlePrint = () => {
    const printWindow = window.open(pdfUrl, '_blank');
    printWindow.onload = () => {
      printWindow.print();
    };
  };

  const handleDownload = async () => {
    try {
      const timestamp = new Date().getTime();
      const downloadUrl = `${API_BASE}/admin/certificados/certificado/codigo/${certificateCode}/pdf?v=${timestamp}`;
      window.open(downloadUrl, '_blank');
    } catch (error) {
      console.error('Error downloading PDF:', error);
      alert('Error al descargar el certificado');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-11/12 h-5/6 max-w-6xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            Previsualización del Certificado
          </h3>
          <div className="flex items-center space-x-2">
            <button
              onClick={handlePrint}
              className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <Printer className="w-4 h-4 mr-2" />
              Imprimir
            </button>
            <button
              onClick={handleDownload}
              className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
            >
              <Download className="w-4 h-4 mr-2" />
              Descargar
            </button>
            <button
              onClick={onClose}
              className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <X className="w-4 h-4 mr-2" />
              Cerrar
            </button>
          </div>
        </div>

        {/* PDF Viewer */}
        <div className="flex-1 p-4">
          <object
            data={pdfUrl}
            type="application/pdf"
            className="w-full h-full border border-gray-300 rounded-lg"
            title="Vista previa del certificado"
          >
            <div className="flex flex-col items-center justify-center h-full text-gray-500">
              <FileText className="w-16 h-16 mb-4" />
              <p className="text-lg mb-2">No se puede mostrar el PDF en este navegador</p>
              <p className="text-sm mb-4">Usa los botones de arriba para descargar o imprimir</p>
              <a 
                href={pdfUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-800 underline"
              >
                Abrir PDF en nueva pestaña
              </a>
            </div>
          </object>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 bg-gray-50">
          <p className="text-sm text-gray-600 text-center">
            Código de verificación: <span className="font-mono font-semibold">{certificateCode}</span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default PDFPreviewModal;
