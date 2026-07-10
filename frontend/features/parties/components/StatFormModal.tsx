// frontend/features/parties/components/StatFormModal.tsx
'use client';

import React from 'react';
// ※ PokemonCard の import パスは実際の配置に合わせてください
import { PokemonCard } from '@/features/bulids/components/BuildFormCard'; 
import { PokemonInfo } from '@/features/pokedex/types';

interface StatFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  // 仮の initialData の代わりに、PokemonCard が必要とするデータを定義
  buildId?: string;              // 既存のデータを編集・流用する場合
  pokemonInfo?: PokemonInfo;     // 新規作成の場合のマスタデータ
  onSuccess?: () => void;        // 保存成功時のコールバック
}

export const StatFormModal: React.FC<StatFormModalProps> = ({ 
  isOpen, 
  onClose, 
  buildId, 
  pokemonInfo, 
  onSuccess 
}) => {
  if (!isOpen) return null;

  // APIでの保存が完了した時の処理
  const handleSuccess = () => {
    if (onSuccess) onSuccess();
    onClose(); // モーダルを閉じる
  };

  return (
    // 背景の黒帯。全体をスクロール可能にしておく
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-sm overflow-y-auto">
      
      {/* 
        モーダルのコンテンツ領域 
        PokemonCardが広いので max-w-5xl など横幅を広く取ります
      */}
      <div className="relative w-full max-w-5xl my-auto animate-in fade-in zoom-in-95 duration-200">
        
        {/* 閉じるボタン（カードの外側・右上に配置すると見栄えがスッキリします） */}
        <button 
          onClick={onClose} 
          className="absolute -top-12 right-0 text-white hover:text-gray-200 p-2 rounded-full transition-colors z-10 flex items-center gap-2"
          aria-label="閉じる"
        >
          <span className="font-bold text-sm hidden sm:block">閉じる</span>
          <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>

        {/* 
          フォーム本体の表示領域 
          画面の高さを超えないように max-h-[85vh] を指定し、内部をスクロールさせます
        */}
        <div className="max-h-[85vh] overflow-y-auto rounded-2xl shadow-2xl bg-white custom-scrollbar">
           
           <PokemonCard 
              id={buildId}
              pokemonInfo={pokemonInfo}
              submitLabel="パーティに追加" // ボタンのテキストを上書き
              onSuccess={handleSuccess}   // ★前のステップで PokemonCard に追加した想定の Props
           />
           
        </div>
      </div>
    </div>
  );
};