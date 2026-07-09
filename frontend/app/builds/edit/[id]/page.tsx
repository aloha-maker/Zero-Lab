// frontend/app/builds/edit/[id]/page.tsx
'use client';

import React, { use } from 'react';
import { PokemonCard } from '@/features/bulids/components/BuildFormCard';

interface EditBuildPageProps {
    params: Promise<{ id: string }>;
}

export default function EditBuildPage({ params }: EditBuildPageProps) {
  const { id } = use(params);

  return (
    <main className="min-h-screen bg-slate-100 p-8 flex flex-col items-center">
      <div className="w-full max-w-4xl">
        <h1 className="text-xl font-bold mb-6 text-gray-700">⚔️ ポケモンの調整変更</h1>
        
        <PokemonCard
          id={id}
          submitLabel="変更を保存する"
        />
      </div>
    </main>
  );
}