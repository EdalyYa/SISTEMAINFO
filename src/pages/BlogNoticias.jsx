import React from 'react';
import BlogNoticias from '../components/BlogNoticias';
import { FaNewspaper } from 'react-icons/fa';

function BlogNoticiasPage() {
  const compact = true;
  return (
    <main className="bg-white min-h-screen">
      <section className={compact ? "max-w-7xl mx-auto px-4 py-4" : "max-w-7xl mx-auto px-6 py-8"}>
        {!compact && (
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800 border border-slate-800 p-6 mb-6 shadow-xl ring-1 ring-blue-300/30">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-600 via-emerald-500 to-indigo-600"></div>
            <div className="flex items-center gap-3 text-white">
              <h1 className="text-2xl md:text-3xl font-bold">Noticias y Blog − Instituto de Informática INFOUNA</h1>
            </div>
            <p className="text-slate-200 mt-2">Actualizaciones, comunicados y novedades del Instituto de Informática INFOUNA.</p>
            <div className="mt-3 flex flex-wrap gap-2">
            </div>
          </div>
        )}
        <BlogNoticias compact={compact} />
      </section>
    </main>
  );
}

export default BlogNoticiasPage;
