import React from 'react';
import FAQAccordion from '../components/FAQAccordion';

function FAQPage() {
  return (
    <main className="bg-white min-h-screen">
      <section className="max-w-4xl mx-auto px-6 py-8">
        <header className="mb-6 text-center">
          <h1 className="text-3xl font-bold text-blue-900">Preguntas Frecuentes</h1>
          <p className="text-gray-600 mt-2">Respuestas rápidas sobre certificados, matrícula, pagos y horarios</p>
        </header>
        <FAQAccordion />
      </section>
    </main>
  );
}

export default FAQPage;

