import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import TuitionModal from '../components/TuitionModal';
import ImageOptimized from '../components/ImageOptimized';

const programs = [
  {
    id: 1,
    title: 'Especialista en Diseño Multimedia',
    description: 'Dirigido a creativos que buscan dominar herramientas para el diseño multimedia',
    courses: [
      { 
        name: 'Adobe Photoshop CC 2024', 
        modality: 'Presencial', 
        schedule: 'Lunes y Miércoles 6-8pm', 
        image: '/course1.jpg',
        duration: '72 horas',
        instructor: 'Prof. Juan Pérez',
        level: 'Intermedio'
      },
      { 
        name: 'Adobe Illustrator Avanzado', 
        modality: 'Virtual', 
        schedule: 'Martes y Jueves 7-9pm', 
        image: '/course2.jpg',
        duration: '48 horas',
        instructor: 'Prof. María López',
        level: 'Avanzado'
      },
    ],
  },
  {
    id: 2,
    title: 'Especialista en Excel',
    description: 'Profesionales que desean mejorar sus habilidades en Excel',
    courses: [
      { 
        name: 'Excel Básico a Intermedio', 
        modality: 'Presencial', 
        schedule: 'Lunes y Miércoles 4-6pm', 
        image: 'src/Imagenes/Excel.png',
        duration: '60 horas',
        instructor: 'Prof. Carlos Rodríguez',
        level: 'Básico'
      },
      { 
        name: 'Excel Avanzado y Dashboard', 
        modality: 'Virtual', 
        schedule: 'Sábados 9-12pm', 
        image: '/course4.jpg',
        duration: '48 horas',
        instructor: 'Prof. Ana García',
        level: 'Intermedio'
      },
    ],
  },
    {
    id: 3,
    title: 'Especialista en Excel',
    description: 'Profesionales que desean mejorar sus habilidades en Excel',
    courses: [
      { 
        name: 'Excel Básico a Intermedio', 
        modality: 'Presencial', 
        schedule: 'Lunes y Miércoles 4-6pm', 
        image: '/course3.jpg',
        duration: '60 horas',
        instructor: 'Prof. Carlos Rodríguez',
        level: 'Básico'
      },
      { 
        name: 'Excel Avanzado y Dashboard', 
        modality: 'Virtual', 
        schedule: 'Sábados 9-12pm', 
        image: '/course4.jpg',
        duration: '48 horas',
        instructor: 'Prof. Ana García',
        level: 'Intermedio'
      },
    ],
  },
    {
    id: 4,
    title: 'Especialista en Excel',
    description: 'Profesionales que desean mejorar sus habilidades en Excel',
    courses: [
      { 
        name: 'Excel Básico a Intermedio', 
        modality: 'Presencial', 
        schedule: 'Lunes y Miércoles 4-6pm', 
        image: '/course3.jpg',
        duration: '60 horas',
        instructor: 'Prof. Carlos Rodríguez',
        level: 'Básico'
      },
      { 
        name: 'Excel Avanzado y Dashboard', 
        modality: 'Virtual', 
        schedule: 'Sábados 9-12pm', 
        image: '/course4.jpg',
        duration: '48 horas',
        instructor: 'Prof. Ana García',
        level: 'Intermedio'
      },
    ],
  },
    {
    id: 5,
    title: 'Especialista en Excel',
    description: 'Profesionales que desean mejorar sus habilidades en Excel',
    courses: [
      { 
        name: 'Excel Básico a Intermedio', 
        modality: 'Presencial', 
        schedule: 'Lunes y Miércoles 4-6pm', 
        image: '/course3.jpg',
        duration: '60 horas',
        instructor: 'Prof. Carlos Rodríguez',
        level: 'Básico'
      },
      { 
        name: 'Excel Avanzado y Dashboard', 
        modality: 'Virtual', 
        schedule: 'Sábados 9-12pm', 
        image: '/course4.jpg',
        duration: '48 horas',
        instructor: 'Prof. Ana García',
        level: 'Intermedio'
      },
    ],
  },
];

function CourseDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const program = programs.find(p => p.id === parseInt(id));

  if (!program) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600">Programa no encontrado</h2>
          <button 
            onClick={() => navigate('/')}
            className="mt-4 bg-blue-900 text-white px-6 py-2 rounded hover:bg-blue-800"
          >
            Volver al inicio
          </button>
        </div>
      </div>
    );
  }

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-6">
      <div className="max-w-6xl mx-auto">
        <button 
          onClick={() => navigate('/')}
          className="mb-6 bg-blue-900 text-white px-4 py-2 rounded hover:bg-blue-800 transition"
        >
          ← Volver al catálogo
        </button>

        <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
          <h1 className="text-3xl font-bold text-blue-900 mb-4">{program.title}</h1>
          <p className="text-gray-700 text-lg mb-6">{program.description}</p>
          
          <button
            onClick={openModal}
            className="bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700 transition"
          >
            Ver tasas y pagos
          </button>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-8">
          <h2 className="text-2xl font-bold text-blue-900 mb-6">Cursos del Programa</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {program.courses.map((course, index) => (
              <div key={index} className="border rounded-lg p-4 hover:shadow-md transition">
                <ImageOptimized 
                  src={course.image || '/src/logo.png'} 
                  alt={course.name}
                  className="w-full h-48 rounded mb-3"
                />
                
                <h3 className="text-lg font-semibold text-blue-900 mb-2">{course.name}</h3>
                
                <div className="space-y-1.5 text-gray-700 text-sm">
                  <p><strong>Modalidad:</strong> {course.modality}</p>
                  <p><strong>Horario:</strong> {course.schedule}</p>
                  <p><strong>Duración:</strong> {course.duration}</p>
                  <p><strong>Instructor:</strong> {course.instructor}</p>
                  <p><strong>Nivel:</strong> {course.level}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <TuitionModal 
        isOpen={isModalOpen}
        onClose={closeModal}
        program={program}
      />
    </div>
  );
}

export default CourseDetails;
