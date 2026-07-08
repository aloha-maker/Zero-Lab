// frontend/features/bulids/components/AddPokemonModal.tsx
'use client';

import React from 'react';
import { PokemonInfo } from '../../pokedex/types';
import PokemonSearchForm from '../../pokedex/components/PokemonSearchForm';

interface AddPokemonModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSearchSuccess: (data: PokemonInfo) => void;
  onLoadSaved: () => void;
}

export const AddPokemonModal: React.FC<AddPokemonModalProps> = ({ 
  isOpen, 
  onClose, 
  onSearchSuccess, 
  onLoadSaved 
}) => {
  
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-visible animate-in fade-in zoom-in-95 duration-200">
        <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-gray-50">
          <h3 className="font-bold text-gray-800 text-lg flex items-center gap-2">
            <span role="img" aria-label="monster-ball">🔴</span> ポケモンをパーティに追加
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1">
            <span role="img" aria-label="close">✖️</span>
          </button>
        </div>
        
        <div className="p-6 space-y-6">
          {/* ① 検索フォームセクション */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">① 新しく検索して育成する</label>
            
            {/* PokemonSearchForm コンポーネントを呼び出す */}
            <PokemonSearchForm
              onSearchStart={() => console.log('検索を開始します...')}
              onSearchSuccess={(data) => {
                onSearchSuccess(data);
                onClose(); // 成功したらモーダルを閉じる
              }}
              onSearchError={(msg) => alert(`エラー: ${msg}`)}
            />
            <p className="text-xs text-gray-500 mt-2">種族値などの基本データを取得して新規フォームを開きます。</p>
          </div>

          <div className="relative py-4">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-400 font-medium">または</span>
            </div>
          </div>

          {/* ② 登録済み呼び出しセクション */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">② 登録済みのポケモンから選ぶ</label>
            <button 
              onClick={onLoadSaved}
              className="w-full bg-white hover:bg-gray-50 text-gray-700 px-4 py-3 rounded-lg font-bold transition-colors border border-gray-300 shadow-sm flex items-center justify-center gap-2"
            >
              <span role="img" aria-label="box">📦</span> ボックス（育成済み一覧）を開く
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};