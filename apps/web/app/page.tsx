'use client';

import React from 'react';

export default function Home() {
  return (
    <main className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center">
      <div className="max-w-lg bg-white rounded-3xl shadow-xl p-8 border border-amber-100">
        <div className="w-16 h-16 bg-amber-100 text-amber-800 rounded-2xl flex items-center justify-center mx-auto mb-5 text-2xl font-bold">
          BL
        </div>
        <h1 className="text-3xl font-extrabold text-[#2C1810] tracking-tight mb-2">
          BrewLite Coffee
        </h1>
        <p className="text-amber-700 font-semibold mb-4">
          Task 4.1 â€” Thiáº¿t láº­p khung Monorepo & CI Pipeline
        </p>
        <p className="text-gray-600 text-sm leading-relaxed mb-6">
          Há»‡ thá»‘ng Ä‘áº·t cÃ  phÃª trá»±c tuyáº¿n theo mÃ´ hÃ¬nh mobile-first PWA. Khung há»‡ thá»‘ng gá»“m Next.js (apps/web) vÃ  NestJS (apps/api) vá»›i PostgreSQL vÃ  Docker Ä‘Ã£ Ä‘Æ°á»£c thiáº¿t láº­p sáºµn sÃ ng cho Sprint 1.
        </p>
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-800 text-sm font-semibold rounded-full border border-emerald-200">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
          Monorepo Scaffold & CI Pipeline Active
        </div>
      </div>
    </main>
  );
}
