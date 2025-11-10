import React, { useState } from 'react';

const faqs = [
  {
    question: '¿Qué es INFOUNA?',
    answer: 'Es el Instituto de Informática de la Universidad Nacional del Altiplano, especializado en formación tecnológica y certificación oficial.'
  },
  {
    question: '¿Cómo me inscribo en un curso?',
    answer: 'Puedes inscribirte desde la web, sección Matrícula, o acercándote a nuestras oficinas en la UNA.'
  },
  {
    question: '¿Los certificados son válidos para la UNA?',
    answer: 'Sí, todos los certificados INFOUNA tienen validez oficial y pueden ser convalidados en la UNA.'
  },
  {
    question: '¿Hay cursos gratuitos?',
    answer: 'Sí, INFOUNA ofrece cursos gratuitos y de pago, revisa el catálogo para más información.'
  },
];

function FAQAccordion() {
  const [open, setOpen] = useState(null);
  return (
    <section className="bg-white py-12 px-6">
      <div className="max-w-2xl mx-auto">
        <h2 className="text-2xl font-bold text-blue-900 mb-6 text-center">Preguntas Frecuentes</h2>
        <div className="space-y-4">
          {faqs.map((faq, i) => (
            <div key={i} className="border rounded-lg shadow hover:shadow-lg transition">
              <button
                className={`w-full text-left px-6 py-4 font-semibold flex justify-between items-center focus:outline-none ${open === i ? 'bg-blue-50' : 'bg-white'}`}
                onClick={() => setOpen(open === i ? null : i)}
              >
                <span>{faq.question}</span>
                <span className={`ml-4 text-blue-700 transition-transform duration-300 ${open === i ? 'rotate-90' : ''}`}>▶</span>
              </button>
              {open === i && (
                <div className="px-6 pb-4 text-gray-700 animate-fade-in">
                  {faq.answer}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default FAQAccordion;
