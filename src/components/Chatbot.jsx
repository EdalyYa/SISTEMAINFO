import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

function Chatbot() {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    { from: 'bot', text: '¡Hola! Soy Ana, tu asesora académica de INFOUNA 😊. Trabajo aquí desde hace 3 años y conozco todos nuestros cursos al detalle. ¿Cómo te llamas? ¿En qué puedo ayudarte hoy?', timestamp: new Date() }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [quickActions, setQuickActions] = useState([]); // acciones navegables del último mensaje
  const [conversationContext, setConversationContext] = useState({
    userName: null,
    userInterests: [],
    conversationStage: 'greeting',
    lastTopic: null,
    askedQuestions: []
  });
  const messagesEndRef = useRef(null);

  // Base de conocimientos del instituto con personalidad humana
  const knowledgeBase = {
    // Información general con toque personal
    'hola': [
      '¡Hola! Me da mucho gusto conocerte 😊. Soy Ana y llevo trabajando en INFOUNA desde 2021. ¿Cómo te llamas?',
      '¡Qué tal! Soy Ana, tu asesora académica favorita 😄. ¿En qué puedo ayudarte hoy?'
    ],
    'buenos dias': ['¡Buenos días! ☀️ Espero que tengas un día excelente. Soy Ana, ¿cómo puedo ayudarte?'],
    'buenas tardes': ['¡Buenas tardes! 🌅 Perfecto momento para hablar sobre tu futuro académico. ¿Qué te interesa?'],
    'buenas noches': ['¡Buenas noches! 🌙 Aunque sea tarde, siempre tengo tiempo para ayudarte. ¿Qué necesitas?'],
    
    // Respuestas sobre ella misma
    'quien eres': [
      'Soy Ana Rodríguez, asesora académica de INFOUNA 😊. Tengo 28 años, soy egresada de Ingeniería de Sistemas de la UNA y me especialicé en educación tecnológica. ¡Me encanta ayudar a los estudiantes a encontrar su camino!'
    ],
    'como estas': [
      '¡Muy bien, gracias por preguntar! 😊 Hoy he ayudado a varios estudiantes y me siento súper motivada. ¿Y tú cómo estás?',
      'Excelente, como siempre que hablo con futuros estudiantes 😄. Me emociona mucho poder ayudarte. ¿Cómo te sientes tú?'
    ],
    
    // Cursos y programas con experiencia personal
    'cursos': [
      '¡Oh, los cursos! Es mi tema favorito 😍. Mira, en mis 3 años aquí he visto cómo más de 60 cursos han cambiado vidas:\n\n' +
      '🖥️ **Programación**: Python, Java, C++, Laravel, Go (¡yo enseñé Python el año pasado!)\n' +
      '📊 **Análisis de Datos**: R, Power BI, Big Data, Matlab\n' +
      '🎨 **Diseño**: Photoshop, Illustrator, After Effects\n' +
      '🖥️ **Sistemas**: Linux, Windows Server\n' +
      '📈 **Estadística**: SAS, SPSS, Minitab\n\n' +
      '¿Hay algún área que te llame la atención? Te puedo contar experiencias reales de nuestros estudiantes 😊'
    ],
    'programacion': [
      '¡Programación! 💻 Mi área del corazón. Verás, yo empecé programando en Python hace 6 años y cambió mi vida completamente.\n\n' +
      'Nuestros cursos son increíbles:\n' +
      '🐍 **Python** (Básico, Intermedio, Avanzado) - ¡Mi favorito personal!\n' +
      '☕ **Java** - Perfecto para aplicaciones empresariales\n' +
      '⚡ **C# y C++** - Para los que quieren potencia pura\n' +
      '🌐 **Laravel (PHP)** - Desarrollo web moderno\n' +
      '🏃 **Go** - El lenguaje del futuro\n' +
      '📱 **Kotlin** - Para apps móviles\n\n' +
      '¿Te cuento sobre alguno en particular? Tengo historias súper motivadoras de nuestros egresados 😊'
    ],
    'python': [
      '¡PYTHON! 🐍✨ No sabes cuánto me emociona hablar de esto. Fue mi primer lenguaje serio y literalmente me abrió todas las puertas.\n\n' +
      '**Te cuento sobre nuestros niveles:**\n' +
      '📖 **Python Básico**: Aquí empezamos desde cero. Recuerdo a María, una contadora que nunca había programado, ¡ahora automatiza toda su empresa!\n' +
      '📊 **Python Intermedio**: Desarrollo web y análisis de datos. Carlos, un estudiante del año pasado, consiguió trabajo en una startup.\n' +
      '🚀 **Python Avanzado**: Machine Learning e IA. ¡Aquí es donde la magia realmente sucede!\n\n' +
      'Cada curso son 40 horas académicas con certificación UNA.\n\n' +
      '¿Te interesa algún nivel específico? ¿O prefieres que te cuente más historias de éxito? 😊'
    ],
    'diseno': [
      '🎨 **Cursos de Diseño:**\n\n' +
      '🖼️ Adobe Photoshop - Edición fotográfica\n' +
      '✏️ Adobe Illustrator - Ilustración vectorial\n' +
      '🎬 Adobe After Effects - Animación\n' +
      '🎥 Adobe Premiere - Edición de video\n' +
      '📄 Adobe InDesign - Maquetación\n' +
      '🎨 Corel Draw - Diseño vectorial\n\n' +
      '¿Qué área del diseño te interesa más?'
    ],
    
    // Información académica con experiencia personal
    'horarios': [
      'Perfecto, hablemos de horarios 😊. Sabes, una de las cosas que más me gusta de INFOUNA es nuestra flexibilidad:\n\n' +
      '🌅 **Mañana**: 8:00 AM - 12:00 PM (ideal para madres de familia)\n' +
      '🌆 **Tarde**: 2:00 PM - 6:00 PM (perfecto para estudiantes universitarios)\n' +
      '🌙 **Noche**: 6:30 PM - 10:30 PM (para los que trabajan de día)\n' +
      '📅 **Sábados**: 8:00 AM - 4:00 PM (¡mi horario favorito para talleres intensivos!)\n\n' +
      '¿Cuál se acomoda mejor a tu rutina? Te puedo recomendar el mejor horario según tu situación 😊'
    ],
    'duracion': [
      '⏱️ **Duración de cursos:**\n\n' +
      '📚 Cursos libres: 40 horas académicas\n' +
      '📅 Modalidad: 2-3 veces por semana\n' +
      '🗓️ Duración aproximada: 4-6 semanas\n\n' +
      '¿Te interesa algún curso en particular?'
    ],
    'certificacion': [
      '📜 **Certificación:**\n\n' +
      '✅ Todos nuestros cursos incluyen certificado\n' +
      '🏛️ Respaldado por la Universidad Nacional del Altiplano\n' +
      '📋 Certificado de participación al completar el curso\n' +
      '💼 Válido para tu CV profesional\n\n' +
      '¿Necesitas más información sobre algún certificado?'
    ],
    
    // Inscripciones y costos
    'inscripcion': [
      '📝 **Proceso de inscripción:**\n\n' +
      '1️⃣ Elige tu curso de interés\n' +
      '2️⃣ Completa el formulario de inscripción\n' +
      '3️⃣ Realiza el pago correspondiente\n' +
      '4️⃣ Confirma tu cupo\n\n' +
      '📞 También puedes inscribirte llamando o visitando nuestras oficinas.\n' +
      '¿Te gustaría inscribirte en algún curso?'
    ],
    'costo': [
      '💰 **Información de costos:**\n\n' +
      'Los costos varían según el curso y duración.\n' +
      '💳 Aceptamos diferentes formas de pago\n' +
      '🎓 Descuentos especiales para estudiantes UNA\n\n' +
      '📞 Para información específica de precios, contáctanos directamente.\n' +
      '¿Te interesa algún curso en particular?'
    ],
    'pago': [
      '💳 **Formas de pago:**\n\n' +
      '💵 Efectivo en nuestras oficinas\n' +
      '🏦 Transferencia bancaria\n' +
      '💳 Tarjetas de débito/crédito\n' +
      '📱 Pagos digitales\n\n' +
      '¿Necesitas los datos para transferencia?'
    ],
    
    // Ubicación y contacto
    'ubicacion': [
      '📍 **Nuestra ubicación:**\n\n' +
      '🏛️ Instituto de Informática - INFOUNA\n' +
      '🏢 Universidad Nacional del Altiplano\n' +
      '📍 Ciudad Universitaria - Puno, Perú\n\n' +
      '🚌 Fácil acceso en transporte público\n' +
      '🅿️ Estacionamiento disponible'
    ],
    'contacto': [
      '📞 **Contáctanos:**\n\n' +
      '📱 WhatsApp: [Número disponible en la web]\n' +
      '📧 Email: info@infouna.edu.pe\n' +
      '📞 Teléfono: [Consultar en oficinas]\n' +
      '🕒 Atención: Lunes a Viernes 8:00 AM - 6:00 PM\n\n' +
      '¿Prefieres que te contactemos?'
    ],
    
    // Preguntas frecuentes
    'requisitos': [
      '📋 **Requisitos para inscripción:**\n\n' +
      '🆔 Documento de identidad (DNI/CE)\n' +
      '📚 Conocimientos básicos de computación\n' +
      '💻 Acceso a computadora (para cursos virtuales)\n' +
      '🎓 Ganas de aprender\n\n' +
      '¡No necesitas experiencia previa en la mayoría de cursos!'
    ],
    'modalidad': [
      '🖥️ **Modalidades disponibles:**\n\n' +
      '🏢 **Presencial**: En nuestras aulas equipadas\n' +
      '💻 **Virtual**: Clases en línea en vivo\n' +
      '🔄 **Híbrida**: Combinación de ambas\n\n' +
      'Todas las modalidades incluyen material y certificación.\n' +
      '¿Qué modalidad prefieres?'
    ],
    
    // Respuestas emocionales y de seguimiento
    'gracias': [
      '¡Ay, de nada! 😊 Me encanta ayudar, es literalmente lo que más disfruto de mi trabajo. ¿Hay algo más en lo que pueda apoyarte?',
      '¡Para eso estoy aquí! 😄 Sabes, cada vez que ayudo a alguien a encontrar su camino académico, siento que estoy cumpliendo mi propósito. ¿Qué más necesitas?'
    ],
    'no se': [
      'Tranquilo/a, es completamente normal no saber por dónde empezar 😊. ¿Sabes qué? Déjame hacerte algunas pregunitas para conocerte mejor:\n\n' +
      '¿Qué te gusta hacer en tu tiempo libre? ¿Eres más de resolver problemas, crear cosas bonitas, o analizar datos? Con eso puedo recomendarte algo perfecto para ti ✨'
    ],
    'ayuda': [
      'Claro que sí, estoy aquí para eso 😊. Cuéntame, ¿qué es lo que más te preocupa o te interesa? ¿Es sobre:\n\n' +
      '📚 Qué curso elegir\n' +
      '💰 Costos y formas de pago\n' +
      '⏰ Horarios que se ajusten a ti\n' +
      '🎓 Oportunidades laborales\n\n' +
      'O simplemente cuéntame qué tienes en mente, soy toda oídos 👂'
    ]
  };

  // Función para encontrar respuesta inteligente con memoria conversacional
  const findResponse = (userInput) => {
    const input = userInput.toLowerCase().trim();
    
    // Detectar nombre del usuario
    if (input.includes('me llamo') || input.includes('soy ') || input.includes('mi nombre es')) {
      const nameMatch = input.match(/(?:me llamo|soy|mi nombre es)\s+([a-záéíóúñ]+)/i);
      if (nameMatch) {
        const userName = nameMatch[1];
        setConversationContext(prev => ({ ...prev, userName, conversationStage: 'personal', userInterests: [] }));
        return `¡Qué bonito nombre, ${userName}! 😊 Me da mucho gusto conocerte. Cuéntame, ${userName}, ¿qué te trae por aquí? ¿Hay algún curso o área que te llame la atención?`;
      }
    }
    
    // Respuestas personalizadas si ya conocemos el nombre
    const userName = conversationContext.userName;
    const personalGreeting = userName ? `${userName}, ` : '';
    
    // Buscar coincidencias exactas en la base de conocimientos
    for (const [key, responses] of Object.entries(knowledgeBase)) {
      if (input.includes(key)) {
        let response = responses[Math.floor(Math.random() * responses.length)];
        
        // Personalizar respuesta si conocemos el nombre
        if (userName && !response.includes(userName)) {
          if (key === 'cursos' || key === 'programacion' || key === 'python') {
            response = response.replace('¿', `¿${personalGreeting}`);
          }
        }
        
        // Actualizar contexto de conversación
        setConversationContext(prev => ({
          ...prev,
          lastTopic: key,
          askedQuestions: [...prev.askedQuestions, input],
          userInterests: [...prev.userInterests.filter(i => i !== key), key]
        }));
        
        return response;
      }
    }
    
    // Respuestas específicas con personalidad
    if (input.includes('java') || input.includes('c++') || input.includes('c#')) {
      const response = `¡Excelente elección${userName ? `, ${userName}` : ''}! 💻 Esos lenguajes son súper demandados. Te cuento, el año pasado tuve un estudiante de Java que consiguió trabajo antes de terminar el curso. ¿Te interesa más el desarrollo de aplicaciones empresariales o prefieres algo más técnico?`;
      setConversationContext(prev => ({ ...prev, userInterests: [...prev.userInterests, 'programacion'], lastTopic: 'programacion' }));
      return response;
    }
    
    if (input.includes('photoshop') || input.includes('illustrator') || input.includes('diseño')) {
      const response = `¡Qué emocionante${userName ? `, ${userName}` : ''}! 🎨 El diseño es una de mis áreas favoritas para recomendar. Tengo una estudiante, Sofía, que empezó sin saber nada de Photoshop y ahora tiene su propia agencia de diseño. ¿Te inclinas más hacia el diseño gráfico, edición de fotos, o tal vez animación?`;
      setConversationContext(prev => ({ ...prev, userInterests: [...prev.userInterests, 'diseno'], lastTopic: 'diseno' }));
      return response;
    }
    
    if (input.includes('precio') || input.includes('cuanto cuesta') || input.includes('costo')) {
      return `Mira${personalGreeting}te voy a ser súper honesta 😊. Los precios varían según el curso, pero lo que sí te puedo asegurar es que la inversión vale cada centavo. Tenemos opciones de pago súper flexibles y descuentos especiales para estudiantes UNA. ¿Qué curso te interesa específicamente? Así te doy el precio exacto.`;
    }
    
    if (input.includes('donde') || input.includes('direccion') || input.includes('ubicacion')) {
      return `¡Perfecto${personalGreeting}estamos súper bien ubicados! 📍 Nos encuentras en la Ciudad Universitaria de la UNA en Puno. Es súper fácil llegar, hay transporte público directo y tenemos estacionamiento. ¿Vienes de lejos? Te puedo dar indicaciones más específicas 😊`;
    }
    
    if (input.includes('trabajo') || input.includes('empleo') || input.includes('laboral')) {
      return `¡Esa es la pregunta del millón${personalGreeting}! 💼 Te voy a contar algo que me emociona mucho: el 85% de nuestros egresados consigue trabajo o mejora su situación laboral en los primeros 6 meses. ¿Qué área te interesa? Te puedo contar historias específicas de éxito en esa área.`;
    }
    
    // Respuestas empáticas para dudas
    if (input.includes('no se') || input.includes('duda') || input.includes('confundido')) {
      return `${personalGreeting}tranquilo/a, es completamente normal sentirse así 😊. ¿Sabes qué me funciona siempre? Empezar por lo que te gusta hacer. Cuéntame, ¿qué haces en tu tiempo libre? ¿Te gusta resolver problemas, crear cosas, trabajar con números, o tal vez ayudar a otros? Con eso puedo recomendarte algo perfecto para ti ✨`;
    }
    
    // Respuesta por defecto más conversacional
    const defaultResponses = [
      `${personalGreeting}me encanta que me preguntes eso 😊. Aunque no tengo información específica sobre ese tema, puedo ayudarte con todo lo relacionado a nuestros cursos. ¿Qué te parece si empezamos por conocer qué te gusta hacer?`,
      `Interesante pregunta${personalGreeting}🤔. Aunque no manejo esa información específica, soy experta en ayudarte a encontrar el curso perfecto para ti. ¿Me cuentas un poco sobre tus intereses?`,
      `${personalGreeting}sabes qué, no tengo esa información exacta, pero lo que sí puedo hacer es ayudarte a descubrir qué curso sería ideal para ti. ¿Qué opinas si hacemos un pequeño test de intereses? 😊`
    ];
    
    return defaultResponses[Math.floor(Math.random() * defaultResponses.length)];
  };

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage = { from: 'user', text: input, timestamp: new Date() };
    setMessages(prev => [...prev, userMessage]);
    const currentInput = input; // Guardar el input antes de limpiarlo
    setInput('');
    setIsTyping(true);

    try {
      // Llamada al backend para una respuesta más robusta
      const resp = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: currentInput,
          history: messages.map(m => ({ role: m.from, content: m.text })),
          profile: {
            name: conversationContext.userName || null,
            interests: conversationContext.userInterests || []
          }
        })
      });

      if (resp.ok) {
        const data = await resp.json();
        const suggestions = Array.isArray(data.suggestions) && data.suggestions.length
          ? `\n\nSugerencias:\n${data.suggestions.map(s => `• ${s}`).join('\n')}`
          : '';
        const botMessage = { from: 'bot', text: `${data.reply || ''}${suggestions}`, timestamp: new Date() };
        // Acciones navegables si el backend las provee
        if (data.links && (data.links.course || data.links.enroll)) {
          const actions = [];
          if (data.links.course) actions.push({ label: 'Ver curso', to: data.links.course });
          if (data.links.enroll) actions.push({ label: 'Inscribirme', to: data.links.enroll });
          setQuickActions(actions);
        } else {
          setQuickActions([]);
        }
        // Simular un pequeño tiempo de escritura para naturalidad
        setTimeout(() => {
          setMessages(prev => [...prev, botMessage]);
          setIsTyping(false);
        }, 800);
        return;
      }
      // Fallback a la lógica local si la API falla
      const botResponse = findResponse(currentInput);
      const botMessage = { from: 'bot', text: botResponse, timestamp: new Date() };
      setTimeout(() => {
        setMessages(prev => [...prev, botMessage]);
        setIsTyping(false);
      }, 800);
      setQuickActions([]);
    } catch (e) {
      // Fallback por error de red
      const botResponse = findResponse(currentInput);
      const botMessage = { from: 'bot', text: botResponse, timestamp: new Date() };
      setTimeout(() => {
        setMessages(prev => [...prev, botMessage]);
        setIsTyping(false);
      }, 800);
      setQuickActions([]);
    }
  };

  // Auto-scroll al final de los mensajes
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  // Cargar perfil desde localStorage al iniciar
  useEffect(() => {
    try {
      const saved = localStorage.getItem('chatProfile');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && (parsed.name || parsed.interests)) {
          setConversationContext(prev => ({
            ...prev,
            userName: parsed.name || prev.userName,
            userInterests: Array.isArray(parsed.interests) ? parsed.interests : prev.userInterests,
            conversationStage: parsed.name ? 'personal' : prev.conversationStage
          }));
        }
      }
    } catch (_) {}
  }, []);

  // Persistir perfil cuando cambia nombre o intereses
  useEffect(() => {
    try {
      const profile = {
        name: conversationContext.userName || null,
        interests: conversationContext.userInterests || []
      };
      localStorage.setItem('chatProfile', JSON.stringify(profile));
    } catch (_) {}
  }, [conversationContext.userName, conversationContext.userInterests]);

  return (
    <div>
      {/* Botón flotante mejorado */}
      <button
        className="fixed bottom-6 right-28 z-50 bg-gradient-to-r from-blue-600 to-blue-600 text-white rounded-full px-6 py-4 shadow-xl hover:shadow-2xl hover:from-blue-700 hover:to-blue-800 transition-all duration-300 transform hover:scale-105 flex items-center gap-3 font-semibold"
        onClick={() => setOpen(o => !o)}
        aria-label="Abrir chatbot"
      >
        <span className="text-2xl">🤖</span>
        <span className="hidden sm:block">Chat INFOUNA</span>
        {!open && (
          <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full animate-pulse"></div>
        )}
      </button>

      {/* Ventana del chat mejorada */}
      {open && (
        <div className="fixed bottom-24 right-28 w-96 bg-white rounded-2xl shadow-2xl z-50 flex flex-col animate-fade-in border border-gray-200 overflow-hidden">
          {/* Header del chat */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                🤖
              </div>
              <div>
                <h3 className="font-bold text-lg">Asistente INFOUNA</h3>
                <p className="text-blue-100 text-sm">En línea • Responde rápido</p>
              </div>
            </div>
            <button
              onClick={() => setOpen(false)}
              className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30 transition-colors"
            >
              ✕
            </button>
          </div>

          {/* Área de mensajes */}
          <div className="flex-1 px-4 py-4 overflow-y-auto bg-gray-50" style={{ maxHeight: '400px' }}>
            {messages.map((m, i) => (
              <div key={i} className={`mb-4 flex ${m.from === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-xs lg:max-w-md px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                  m.from === 'user' 
                    ? 'bg-blue-600 text-white rounded-br-md' 
                    : 'bg-white text-gray-800 rounded-bl-md shadow-sm border'
                }`}>
                  <div className="whitespace-pre-line">{m.text}</div>
                  <div className={`text-xs mt-2 ${m.from === 'user' ? 'text-blue-100' : 'text-gray-500'}`}>
                    {m.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              </div>
            ))}
            
            {/* Indicador de escritura */}
            {isTyping && (
              <div className="flex justify-start mb-4">
                <div className="bg-white text-gray-800 px-4 py-3 rounded-2xl rounded-bl-md shadow-sm border">
                  <div className="flex items-center gap-1">
                    <div className="flex gap-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                    <span className="text-xs text-gray-500 ml-2">escribiendo...</span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input mejorado */}
          <div className="flex border-t bg-white px-4 py-4 gap-3">
            <input
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              className="flex-1 border border-gray-300 rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Escribe tu mensaje..."
              onKeyDown={e => e.key === 'Enter' && sendMessage()}
              disabled={isTyping}
            />
            <button 
              onClick={sendMessage} 
              disabled={!input.trim() || isTyping}
              className="bg-blue-600 text-white px-4 py-2 rounded-full hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center min-w-[44px]"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </button>
          </div>

          {/* Sugerencias rápidas */}
          <div className="px-4 pb-4 bg-white">
            {/* Acciones navegables provenientes del backend */}
            {quickActions.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-2">
                {quickActions.map((a, idx) => (
                  <button
                    key={`${a.label}-${idx}`}
                    onClick={() => navigate(a.to)}
                    className="text-xs bg-blue-100 text-blue-700 px-3 py-1 rounded-full hover:bg-blue-200 transition-colors"
                  >
                    {a.label}
                  </button>
                ))}
              </div>
            )}
            <div className="flex flex-wrap gap-2">
              {['Cursos', 'Horarios', 'Inscripción', 'Contacto'].map((suggestion) => (
                <button
                  key={suggestion}
                  onClick={() => setInput(suggestion)}
                  className="text-xs bg-gray-100 text-gray-700 px-3 py-1 rounded-full hover:bg-gray-200 transition-colors"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      <style jsx="true">{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(20px) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
        
        .animate-fade-in {
          animation: fade-in 0.3s ease-out forwards;
        }
      `}</style>
    </div>
  );
}

export default Chatbot;
