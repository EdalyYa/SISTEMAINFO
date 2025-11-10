import React from 'react';
import BlogNoticias from '../components/BlogNoticias';

function BlogNoticiasPage() {
  return (
    <main className="bg-gray-50 min-h-screen">
      <section className="max-w-7xl mx-auto px-6 py-8">
        <header className="mb-6 text-center">
          <h1 className="text-3xl font-bold text-blue-900">Noticias y Blog</h1>
          <p className="text-gray-600 mt-2">Actualizaciones tecnológicas y novedades del instituto</p>
        </header>
        <BlogNoticias />
      </section>
    </main>
  );
}

export default BlogNoticiasPage;

