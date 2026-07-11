"use client";

import React from 'react';
import { SeasonDataPage } from '@/features/season/components/SeasonDataPage'

export default function Step1OnlyPage() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', fontFamily: 'sans-serif', margin: 0 }}>
      <main style={{ flex: 1, display: 'flex' }}>
        {/* Propsを渡さないことで、Step1Page内部のデータ状態が使われます */}
        <SeasonDataPage />
      </main>
    </div>
  );
}