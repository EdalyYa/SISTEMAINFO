// Configuración de categorías tecnológicas
export const TECH_CATEGORIES = {
  all: {
    id: 'all',
    name: 'Todas las Noticias',
    icon: '🌐',
    color: 'from-gray-500 to-gray-700',
    bgColor: 'bg-gray-100',
    textColor: 'text-gray-700',
    keywords: []
  },
  programming: {
    id: 'programming',
    name: 'Programación',
    icon: '💻',
    color: 'from-blue-500 to-blue-700',
    bgColor: 'bg-blue-100',
    textColor: 'text-blue-700',
    keywords: ['javascript', 'python', 'java', 'react', 'node.js', 'programming', 'coding', 'software development', 'web development', 'mobile development']
  },
  ai_ml: {
    id: 'ai_ml',
    name: 'IA & Machine Learning',
    icon: '🤖',
    color: 'from-purple-500 to-purple-700',
    bgColor: 'bg-purple-100',
    textColor: 'text-purple-700',
    keywords: ['artificial intelligence', 'machine learning', 'AI', 'ML', 'deep learning', 'neural networks', 'chatgpt', 'openai', 'automation']
  },
  cybersecurity: {
    id: 'cybersecurity',
    name: 'Ciberseguridad',
    icon: '🔒',
    color: 'from-red-500 to-red-700',
    bgColor: 'bg-red-100',
    textColor: 'text-red-700',
    keywords: ['cybersecurity', 'security', 'hacking', 'encryption', 'privacy', 'data protection', 'malware', 'ransomware', 'breach']
  },
  cloud: {
    id: 'cloud',
    name: 'Cloud Computing',
    icon: '☁️',
    color: 'from-cyan-500 to-cyan-700',
    bgColor: 'bg-cyan-100',
    textColor: 'text-cyan-700',
    keywords: ['cloud computing', 'AWS', 'Azure', 'Google Cloud', 'serverless', 'containers', 'kubernetes', 'docker']
  },
  data_analysis: {
    id: 'data_analysis',
    name: 'Análisis de Datos',
    icon: '📊',
    color: 'from-green-500 to-green-700',
    bgColor: 'bg-green-100',
    textColor: 'text-green-700',
    keywords: ['data analysis', 'big data', 'analytics', 'business intelligence', 'data science', 'visualization', 'power bi', 'tableau']
  },
  design: {
    id: 'design',
    name: 'Diseño Digital',
    icon: '🎨',
    color: 'from-pink-500 to-pink-700',
    bgColor: 'bg-pink-100',
    textColor: 'text-pink-700',
    keywords: ['UI/UX', 'design', 'photoshop', 'illustrator', 'graphic design', 'web design', 'user experience', 'adobe']
  }
};

// Relación entre noticias y cursos de INFOUNA
export const COURSE_RELATIONS = {
  // Cursos de Programación
  'Bases de datos y Lenguaje SQL': {
    categories: ['programming', 'data_analysis'],
    keywords: ['sql', 'database', 'mysql', 'postgresql', 'data management'],
    description: 'Gestión y consulta de bases de datos'
  },
  'Programación R y RStudio avanzado': {
    categories: ['programming', 'data_analysis', 'ai_ml'],
    keywords: ['r programming', 'rstudio', 'statistics', 'data analysis'],
    description: 'Análisis estadístico y ciencia de datos'
  },
  'Programación Python básico': {
    categories: ['programming', 'ai_ml', 'data_analysis'],
    keywords: ['python', 'programming', 'coding', 'automation'],
    description: 'Fundamentos de programación moderna'
  },
  'Programación Python intermedio': {
    categories: ['programming', 'ai_ml', 'data_analysis'],
    keywords: ['python', 'advanced programming', 'web development', 'data science'],
    description: 'Desarrollo avanzado con Python'
  },
  'Programación Python avanzado': {
    categories: ['programming', 'ai_ml', 'data_analysis'],
    keywords: ['python', 'machine learning', 'advanced programming', 'ai'],
    description: 'Python para IA y Machine Learning'
  },
  'Programación en C#': {
    categories: ['programming'],
    keywords: ['c#', 'csharp', '.net', 'microsoft', 'software development'],
    description: 'Desarrollo con tecnologías Microsoft'
  },
  'Programación en C++': {
    categories: ['programming'],
    keywords: ['c++', 'cpp', 'systems programming', 'performance'],
    description: 'Programación de sistemas y aplicaciones'
  },
  'Programación en Java': {
    categories: ['programming'],
    keywords: ['java', 'enterprise', 'spring', 'android'],
    description: 'Desarrollo empresarial con Java'
  },
  'Programación en Laravel': {
    categories: ['programming'],
    keywords: ['laravel', 'php', 'web development', 'backend'],
    description: 'Desarrollo web con PHP y Laravel'
  },
  'Programación en JavaScript': {
    categories: ['programming'],
    keywords: ['javascript', 'js', 'web development', 'frontend'],
    description: 'Desarrollo web interactivo'
  },
  'React.js': {
    categories: ['programming'],
    keywords: ['react', 'reactjs', 'frontend', 'javascript', 'ui'],
    description: 'Interfaces modernas con React'
  },
  'Node.js': {
    categories: ['programming'],
    keywords: ['nodejs', 'javascript', 'backend', 'server'],
    description: 'Backend con JavaScript'
  },
  'Vue.js': {
    categories: ['programming'],
    keywords: ['vue', 'vuejs', 'frontend', 'javascript'],
    description: 'Framework progresivo para web'
  },
  'Angular': {
    categories: ['programming'],
    keywords: ['angular', 'typescript', 'frontend', 'spa'],
    description: 'Aplicaciones web robustas'
  },
  'Programación Google Colab': {
    categories: ['programming', 'ai_ml', 'data_analysis'],
    keywords: ['google colab', 'jupyter', 'python', 'data science'],
    description: 'Notebooks colaborativos en la nube'
  },
  'Programación en Go': {
    categories: ['programming', 'cloud'],
    keywords: ['golang', 'go', 'systems programming', 'cloud'],
    description: 'Lenguaje moderno para sistemas'
  },
  'Programación Kotlin': {
    categories: ['programming'],
    keywords: ['kotlin', 'android', 'mobile development', 'java'],
    description: 'Desarrollo Android moderno'
  },

  // Cursos de IA y Machine Learning
  'Machine Learning': {
    categories: ['ai_ml', 'data_analysis'],
    keywords: ['machine learning', 'ml', 'ai', 'algorithms', 'prediction'],
    description: 'Aprendizaje automático y algoritmos'
  },
  'Deep Learning': {
    categories: ['ai_ml'],
    keywords: ['deep learning', 'neural networks', 'ai', 'tensorflow', 'pytorch'],
    description: 'Redes neuronales profundas'
  },
  'Inteligencia Artificial': {
    categories: ['ai_ml'],
    keywords: ['artificial intelligence', 'ai', 'automation', 'intelligent systems'],
    description: 'IA y sistemas inteligentes'
  },

  // Cursos de Análisis de Datos
  'Power BI': {
    categories: ['data_analysis'],
    keywords: ['power bi', 'business intelligence', 'data visualization', 'microsoft'],
    description: 'Visualización de datos empresariales'
  },
  'Big Data': {
    categories: ['data_analysis', 'cloud'],
    keywords: ['big data', 'hadoop', 'spark', 'data processing'],
    description: 'Procesamiento de grandes volúmenes de datos'
  },
  'Matlab': {
    categories: ['programming', 'data_analysis'],
    keywords: ['matlab', 'mathematical computing', 'engineering', 'simulation'],
    description: 'Computación técnica y análisis numérico'
  },
  'Statistica': {
    categories: ['data_analysis'],
    keywords: ['statistics', 'statistical analysis', 'data mining'],
    description: 'Software estadístico avanzado'
  },
  'Software Minitab': {
    categories: ['data_analysis'],
    keywords: ['minitab', 'quality control', 'statistics', 'six sigma'],
    description: 'Análisis estadístico y control de calidad'
  },
  'Software SAS': {
    categories: ['data_analysis'],
    keywords: ['sas', 'statistical analysis', 'enterprise analytics'],
    description: 'Análisis estadístico empresarial'
  },
  'Software Stata': {
    categories: ['data_analysis'],
    keywords: ['stata', 'econometrics', 'statistics', 'research'],
    description: 'Análisis estadístico y econométrico'
  },
  'Software Eviews': {
    categories: ['data_analysis'],
    keywords: ['eviews', 'econometrics', 'forecasting', 'time series'],
    description: 'Análisis econométrico y forecasting'
  },

  // Cursos de Ciberseguridad
  'Cyberseguridad': {
    categories: ['cybersecurity'],
    keywords: ['cybersecurity', 'security', 'protection', 'threats'],
    description: 'Protección de sistemas y datos'
  },
  'Ethical Hacking': {
    categories: ['cybersecurity'],
    keywords: ['ethical hacking', 'penetration testing', 'security testing'],
    description: 'Hacking ético y pentesting'
  },

  // Cursos de Cloud Computing
  'AWS Cloud': {
    categories: ['cloud'],
    keywords: ['aws', 'amazon web services', 'cloud computing', 'infrastructure'],
    description: 'Servicios en la nube de Amazon'
  },
  'Azure Cloud': {
    categories: ['cloud'],
    keywords: ['azure', 'microsoft cloud', 'cloud computing'],
    description: 'Plataforma Microsoft Cloud'
  },
  'Google Cloud': {
    categories: ['cloud'],
    keywords: ['google cloud', 'gcp', 'cloud computing'],
    description: 'Infraestructura Google Cloud'
  },
  'Docker': {
    categories: ['cloud', 'programming'],
    keywords: ['docker', 'containers', 'virtualization', 'devops'],
    description: 'Contenedores y virtualización'
  },
  'Kubernetes': {
    categories: ['cloud', 'programming'],
    keywords: ['kubernetes', 'container orchestration', 'devops', 'cloud native'],
    description: 'Orquestación de contenedores'
  },

  // Cursos de Diseño
  'Adobe Photoshop': {
    categories: ['design'],
    keywords: ['photoshop', 'image editing', 'graphic design', 'adobe'],
    description: 'Edición y retoque fotográfico'
  },
  'Adobe Illustrator': {
    categories: ['design'],
    keywords: ['illustrator', 'vector graphics', 'graphic design', 'adobe'],
    description: 'Ilustración vectorial profesional'
  },
  'Adobe InDesign': {
    categories: ['design'],
    keywords: ['indesign', 'layout design', 'publishing', 'adobe'],
    description: 'Maquetación editorial profesional'
  },
  'Adobe After Effects': {
    categories: ['design'],
    keywords: ['after effects', 'motion graphics', 'animation', 'adobe'],
    description: 'Animación y efectos visuales'
  },
  'Adobe Premiere': {
    categories: ['design'],
    keywords: ['premiere', 'video editing', 'post production', 'adobe'],
    description: 'Edición de video profesional'
  },
  'Corel Draw': {
    categories: ['design'],
    keywords: ['corel draw', 'vector graphics', 'graphic design'],
    description: 'Diseño gráfico vectorial'
  }
};

// Utilidades para trabajar con las configuraciones
export const getCategoryById = (categoryId) => {
  return TECH_CATEGORIES[categoryId] || TECH_CATEGORIES.all;
};

export const getAllCategories = () => {
  return Object.values(TECH_CATEGORIES);
};

export const getRelatedCourses = (newsItem) => {
  const content = `${newsItem.title} ${newsItem.description}`.toLowerCase();
  const relatedCourses = [];

  for (const [courseName, courseData] of Object.entries(COURSE_RELATIONS)) {
    // Verificar si la categoría de la noticia coincide
    if (courseData.categories.includes(newsItem.category)) {
      relatedCourses.push({
        name: courseName,
        description: courseData.description,
        relevance: 'high'
      });
    }
    
    // Verificar palabras clave
    const keywordMatch = courseData.keywords.some(keyword => 
      content.includes(keyword.toLowerCase())
    );
    
    if (keywordMatch && !relatedCourses.find(course => course.name === courseName)) {
      relatedCourses.push({
        name: courseName,
        description: courseData.description,
        relevance: 'medium'
      });
    }
  }

  // Ordenar por relevancia y limitar a 3
  return relatedCourses
    .sort((a, b) => a.relevance === 'high' ? -1 : 1)
    .slice(0, 3);
};

export const getCoursesByCategory = (categoryId) => {
  const courses = [];
  
  for (const [courseName, courseData] of Object.entries(COURSE_RELATIONS)) {
    if (courseData.categories.includes(categoryId)) {
      courses.push({
        name: courseName,
        description: courseData.description
      });
    }
  }
  
  return courses;
};

// Función para formatear fechas
export const formatNewsDate = (dateString) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffTime = Math.abs(now - date);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 1) {
    return 'Hace 1 día';
  } else if (diffDays < 7) {
    return `Hace ${diffDays} días`;
  } else if (diffDays < 30) {
    const weeks = Math.floor(diffDays / 7);
    return `Hace ${weeks} semana${weeks > 1 ? 's' : ''}`;
  } else {
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }
};

// Función para truncar texto
export const truncateText = (text, maxLength = 150) => {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength).trim() + '...';
};