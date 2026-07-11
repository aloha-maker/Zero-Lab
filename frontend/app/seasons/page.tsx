"use client";

import React from 'react';
import { Step1Page } from '@/features/season/components/step1'
import { useSeasonData } from '@/features/season/components/step1/hooks/useSeasonData';

export default function Step1OnlyPage() {
  // Step1Pageに必要なデータをフックから取得
  const seasonData = useSeasonData();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', fontFamily: 'sans-serif', margin: 0 }}>

      {/* サイドバーなどを配置せず、メインコンテンツとしてStep1Pageのみを表示 */}
      <main style={{ flex: 1, display: 'flex' }}>
        <Step1Page seasonData={seasonData} />
      </main>
    </div>
  );
}