import api from '../config/api';

class NewsAPIService {
  constructor() {
    // El cliente ya no usa la API key directamente; consume el backend.
    this.cache = new Map();
    this.cacheTimeout = 60 * 60 * 1000; // 1 hora en millisegundos
  }

  // Obtener noticias tecnológicas
  async fetchTechNews(category = null, limit = 12) {
    const cacheKey = `tech-news-${category || 'all'}-${limit}`;
    
    // Verificar cache
    if (this.cache.has(cacheKey)) {
      const cached = this.cache.get(cacheKey);
      if (Date.now() - cached.timestamp < this.cacheTimeout) {
        return cached.data;
      }
    }

    try {
      // Consumir backend: devuelve { articles: [...] } ya normalizados.
      const { data } = await api.get('/news', {
        params: { category, limit },
      });
      const processedNews = Array.isArray(data?.articles)
        ? data.articles
        // Si por compatibilidad el backend devolviera formato original:
        : this.processNewsData(data?.articles || []);

      // Guardar en cache
      this.cache.set(cacheKey, {
        data: processedNews,
        timestamp: Date.now()
      });

      return processedNews;
    } catch (error) {
      console.error('Error fetching tech news:', error);
      return this.getFallbackNews();
    }
  }

  // Buscar noticias por palabras clave específicas
  async searchNewsByKeywords(keywords, limit = 6) {
    try {
      // Redirigir la búsqueda al backend (opcional: podríamos añadir /news/search).
      const { data } = await api.get('/news', {
        params: { keywords: keywords.join(' OR '), limit },
      });
      return Array.isArray(data?.articles) ? data.articles : this.processNewsData(data?.articles || []);
    } catch (error) {
      console.error('Error searching news:', error);
      return [];
    }
  }

  // Procesar datos de noticias
  processNewsData(articles) {
    return articles
      .filter(article => 
        article.title && 
        article.description && 
        article.urlToImage &&
        !article.title.includes('[Removed]')
      )
      .map(article => ({
        id: this.generateId(article.url),
        title: article.title,
        description: article.description,
        url: article.url,
        imageUrl: article.urlToImage,
        publishedAt: article.publishedAt,
        source: article.source.name,
        category: this.categorizeNews(article),
        relatedCourses: this.findRelatedCourses(article),
        relevanceScore: this.calculateRelevance(article)
      }))
      .sort((a, b) => b.relevanceScore - a.relevanceScore);
  }

  // Categorizar noticias
  categorizeNews(article) {
    const content = `${article.title} ${article.description}`.toLowerCase();
    
    const categories = {
      programming: ['javascript', 'python', 'java', 'react', 'node', 'programming', 'coding', 'software development', 'web development'],
      ai_ml: ['artificial intelligence', 'machine learning', 'ai', 'ml', 'deep learning', 'neural network', 'chatgpt', 'openai'],
      cybersecurity: ['cybersecurity', 'security', 'hacking', 'breach', 'encryption', 'privacy', 'malware', 'ransomware'],
      cloud: ['cloud computing', 'aws', 'azure', 'google cloud', 'serverless', 'containers', 'kubernetes', 'docker'],
      data_analysis: ['data analysis', 'big data', 'analytics', 'business intelligence', 'data science', 'visualization'],
      design: ['ui/ux', 'design', 'photoshop', 'illustrator', 'graphic design', 'web design', 'user experience']
    };

    for (const [category, keywords] of Object.entries(categories)) {
      if (keywords.some(keyword => content.includes(keyword))) {
        return category;
      }
    }

    return 'programming'; // Categoría por defecto
  }

  // Encontrar cursos relacionados
  findRelatedCourses(article) {
    const content = `${article.title} ${article.description}`.toLowerCase();
    const relatedCourses = [];

    const courseKeywords = {
      'Programación Python básico': ['python', 'programming', 'coding'],
      'Programación JavaScript': ['javascript', 'js', 'web development'],
      'React.js': ['react', 'reactjs', 'frontend'],
      'Machine Learning': ['machine learning', 'ml', 'ai', 'artificial intelligence'],
      'Cyberseguridad': ['cybersecurity', 'security', 'hacking'],
      'AWS Cloud': ['aws', 'cloud computing', 'amazon web services'],
      'Power BI': ['power bi', 'business intelligence', 'data visualization'],
      'Adobe Photoshop': ['photoshop', 'image editing', 'graphic design']
    };

    for (const [course, keywords] of Object.entries(courseKeywords)) {
      if (keywords.some(keyword => content.includes(keyword))) {
        relatedCourses.push(course);
      }
    }

    return relatedCourses.slice(0, 3); // Máximo 3 cursos relacionados
  }

  // Calcular relevancia
  calculateRelevance(article) {
    const content = `${article.title} ${article.description}`.toLowerCase();
    let score = 0;

    // Palabras clave de alta relevancia
    const highRelevanceKeywords = ['programming', 'technology', 'software', 'development', 'ai', 'machine learning'];
    const mediumRelevanceKeywords = ['digital', 'innovation', 'tech', 'computer', 'data'];

    highRelevanceKeywords.forEach(keyword => {
      if (content.includes(keyword)) score += 3;
    });

    mediumRelevanceKeywords.forEach(keyword => {
      if (content.includes(keyword)) score += 1;
    });

    // Bonus por fecha reciente
    const publishedDate = new Date(article.publishedAt);
    const daysDiff = (Date.now() - publishedDate.getTime()) / (1000 * 60 * 60 * 24);
    if (daysDiff < 1) score += 5;
    else if (daysDiff < 3) score += 3;
    else if (daysDiff < 7) score += 1;

    return score;
  }

  // Obtener palabras clave por categoría
  getCategoryKeywords(category) {
    const categoryKeywords = {
      programming: ['javascript', 'python', 'java', 'react', 'programming', 'coding'],
      ai_ml: ['artificial intelligence', 'machine learning', 'AI', 'ML', 'deep learning'],
      cybersecurity: ['cybersecurity', 'security', 'hacking', 'encryption'],
      cloud: ['cloud computing', 'AWS', 'Azure', 'Google Cloud'],
      data_analysis: ['data analysis', 'big data', 'analytics', 'data science'],
      design: ['UI/UX', 'design', 'photoshop', 'graphic design']
    };

    return categoryKeywords[category] || [];
  }

  // Generar ID único
  generateId(url) {
    return btoa(url).replace(/[^a-zA-Z0-9]/g, '').substring(0, 16);
  }

  // Noticias de respaldo (fallback)
  getFallbackNews() {
    return [
      {
        id: 'fallback-1',
        title: 'Python Continues to Dominate Programming Rankings in 2024',
        description: 'Python maintains its position as the most popular programming language, with growing adoption in AI, data science, and web development sectors worldwide. Major tech companies report 40% increase in Python-based projects.',
        url: 'https://www.python.org/success-stories/',
        imageUrl: 'https://images.unsplash.com/photo-1526379095098-d400fd0bf935?w=800&h=600&fit=crop&crop=entropy&auto=format&q=80',
        publishedAt: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(), // 12 horas atrás
        source: 'Tech News Daily',
        category: 'programming',
        relatedCourses: ['Programación Python básico', 'Programación Python intermedio'],
        relevanceScore: 10
      },
      {
        id: 'fallback-2',
        title: 'AI and Machine Learning Job Market Grows 35% This Year',
        description: 'The demand for AI and machine learning professionals continues to surge, with companies investing heavily in automation and intelligent systems. Salaries for ML engineers reach new heights globally.',
        url: 'https://www.kaggle.com/learn',
        imageUrl: 'https://images.unsplash.com/photo-1555255707-c07966088b7b?w=800&h=600&fit=crop&crop=entropy&auto=format&q=80',
        publishedAt: new Date(Date.now() - 1000 * 60 * 60 * 18).toISOString(), // 18 horas atrás
        source: 'AI Weekly',
        category: 'ai_ml',
        relatedCourses: ['Machine Learning', 'Deep Learning', 'Inteligencia Artificial'],
        relevanceScore: 9
      },
      {
        id: 'fallback-3',
        title: 'Cybersecurity Threats Increase 40% in Remote Work Era',
        description: 'Organizations face unprecedented cybersecurity challenges as remote work becomes permanent, driving demand for security professionals. New attack vectors emerge targeting distributed workforces.',
        url: 'https://www.cybersecurity.gov/',
        imageUrl: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=800&h=600&fit=crop&crop=entropy&auto=format&q=80',
        publishedAt: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString(), // 6 horas atrás
        source: 'Security Today',
        category: 'cybersecurity',
        relatedCourses: ['Cyberseguridad', 'Ethical Hacking'],
        relevanceScore: 8
      },
      {
        id: 'fallback-4',
        title: 'Cloud Computing Market Reaches $500 Billion Milestone',
        description: 'Cloud adoption accelerates across industries, with AWS, Azure, and Google Cloud leading the transformation to digital infrastructure. Enterprise migration to cloud reaches 85% completion rate.',
        url: 'https://aws.amazon.com/what-is-cloud-computing/',
        imageUrl: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&h=600&fit=crop&crop=entropy&auto=format&q=80',
        publishedAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1 día atrás
        source: 'Cloud Computing News',
        category: 'cloud',
        relatedCourses: ['AWS Cloud', 'Azure Cloud', 'Google Cloud'],
        relevanceScore: 7
      },
      {
        id: 'fallback-5',
        title: 'Data Analytics Skills Most In-Demand for 2024',
        description: 'Business intelligence and data visualization tools like Power BI see massive adoption as companies prioritize data-driven decisions. Data scientist roles increase by 50% year-over-year.',
        url: 'https://powerbi.microsoft.com/',
        imageUrl: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=600&fit=crop&crop=entropy&auto=format&q=80',
        publishedAt: new Date(Date.now() - 1000 * 60 * 60 * 36).toISOString(), // 1.5 días atrás
        source: 'Data Science Central',
        category: 'data_analysis',
        relatedCourses: ['Power BI', 'Big Data', 'Software SAS'],
        relevanceScore: 6
      },
      {
        id: 'fallback-6',
        title: 'UI/UX Design Trends Reshape Digital Experiences',
        description: 'Modern design tools and methodologies continue to evolve, with Adobe Creative Suite leading innovation in digital design workflows. Demand for UX designers grows 25% globally.',
        url: 'https://www.adobe.com/products/photoshop.html',
        imageUrl: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=800&h=600&fit=crop&crop=entropy&auto=format&q=80',
        publishedAt: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(), // 2 días atrás
        source: 'Design Weekly',
        category: 'design',
        relatedCourses: ['Adobe Photoshop', 'Adobe Illustrator', 'Adobe InDesign'],
        relevanceScore: 5
      },
      {
        id: 'fallback-7',
        title: 'Blockchain Technology Adoption Surges in Financial Sector',
        description: 'Major banks and financial institutions accelerate blockchain implementation for secure transactions and smart contracts. Cryptocurrency market stabilizes with institutional adoption.',
        url: 'https://ethereum.org/',
        imageUrl: 'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=800&h=600&fit=crop&crop=entropy&auto=format&q=80',
        publishedAt: new Date(Date.now() - 1000 * 60 * 60 * 8).toISOString(), // 8 horas atrás
        source: 'Blockchain Today',
        category: 'programming',
        relatedCourses: ['Blockchain', 'Programación en Go'],
        relevanceScore: 7
      },
      {
        id: 'fallback-8',
        title: 'Internet of Things (IoT) Devices Reach 30 Billion Worldwide',
        description: 'IoT ecosystem expansion drives demand for connected device developers and network specialists. Smart city initiatives accelerate globally with 5G infrastructure deployment.',
        url: 'https://www.iot.org/',
        imageUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=800&h=600&fit=crop&crop=entropy&auto=format&q=80',
        publishedAt: new Date(Date.now() - 1000 * 60 * 60 * 14).toISOString(), // 14 horas atrás
        source: 'IoT World',
        category: 'programming',
        relatedCourses: ['Internet de las cosas', 'Programación Python avanzado'],
        relevanceScore: 6
      }
    ];
  }

  // Limpiar cache
  clearCache() {
    this.cache.clear();
  }
}

export default new NewsAPIService();
