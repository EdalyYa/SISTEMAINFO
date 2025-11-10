import React from 'react';

function ContactoRapido() {
  return (
    <section className="py-12 px-4 bg-gray-50">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-3xl font-bold mb-8 text-center text-blue-900">Contacta con INFOUNA</h2>
        <div className="grid md:grid-cols-2 gap-8">
          {/* Información de contacto */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-xl font-semibold mb-4 text-blue-800">Información de Contacto</h3>
            <div className="space-y-4">
              <div className="flex items-center">
                <div className="text-blue-600 mr-3">📍</div>
                <div>
                  <p className="font-medium">Dirección</p>
                  <p className="text-gray-600">Universidad Nacional del Altiplano<br/>Ciudad Universitaria - Puno, Perú</p>
                </div>
              </div>
              <div className="flex items-center">
                <div className="text-blue-600 mr-3">📞</div>
                <div>
                  <p className="font-medium">Teléfono</p>
                  <p className="text-gray-600">(051) 36-9881 anexo 342</p>
                </div>
              </div>
              <div className="flex items-center">
                <div className="text-blue-600 mr-3">✉️</div>
                <div>
                  <p className="font-medium">Email</p>
                  <p className="text-gray-600">informes@infouna.unap.edu.pe</p>
                </div>
              </div>
              <div className="flex items-center">
                <div className="text-blue-600 mr-3">🕒</div>
                <div>
                  <p className="font-medium">Horario de Atención</p>
                  <p className="text-gray-600">Lunes a Viernes: 8:00 AM - 6:00 PM<br/>Sábados: 8:00 AM - 12:00 PM</p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Formulario de contacto */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-xl font-semibold mb-4 text-blue-800">Envíanos un Mensaje</h3>
            <form className="flex flex-col gap-4">
              <input type="text" placeholder="Nombre completo" className="border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500" required />
              <input type="email" placeholder="Correo electrónico" className="border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500" required />
              <input type="tel" placeholder="Teléfono (opcional)" className="border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500" />
              <select className="border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500" required>
                <option value="">Selecciona un tema</option>
                <option value="inscripcion">Inscripción a cursos</option>
                <option value="certificacion">Certificaciones</option>
                <option value="horarios">Horarios y modalidades</option>
                <option value="otros">Otros</option>
              </select>
              <textarea placeholder="Tu mensaje" rows="4" className="border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500" required></textarea>
              <button type="submit" className="bg-blue-900 text-white py-3 rounded-lg font-semibold hover:bg-blue-800 transition duration-300 shadow-lg">
                Enviar Mensaje
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}

export default ContactoRapido;
