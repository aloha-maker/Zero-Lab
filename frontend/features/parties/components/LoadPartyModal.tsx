'use client';

import React, { useState } from 'react';

interface LoadPartyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoadParty: (partyId: string) => void;
}

export const LoadPartyModal: React.FC<LoadPartyModalProps> = ({ isOpen, onClose, onLoadParty }) => {
  const [searchTerm, setSearchTerm] = useState('');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-gray-50">
          <h3 className="font-bold text-gray-800 text-lg flex items-center gap-2">
            <span role="img" aria-label="folder">📁</span> 登録済みパーティを呼び出す
          </h3>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 p-1"
          >
            <span role="img" aria-label="close">✖️</span>
          </button>
        </div>
        
        <div className="p-6 space-y-6">
          {/* パーティ検索 */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">パーティ名で検索</label>
            <div className="flex gap-2">
              <input 
                type="text" 
                placeholder="シーズン10用..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50"
              />
              <button 
                onClick={() => alert(`「${searchTerm}」でパーティを検索します。`)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-bold transition-colors whitespace-nowrap shadow-sm"
              >
                検索
              </button>
            </div>
          </div>

          {/* 最近のパーティリスト（モック） */}
          <div className="space-y-3">
            <p className="text-sm font-bold text-gray-700">最近のパーティ</p>
            <button 
              onClick={() => onLoadParty('party-1')}
              className="w-full text-left p-4 border border-gray-200 rounded-xl hover:bg-blue-50 hover:border-blue-300 transition-colors shadow-sm bg-white"
            >
              <p className="font-bold text-gray-800">シーズン10 ランクマッチ用</p>
              <p className="text-xs text-gray-500 mt-1.5 leading-relaxed">カイリュー / ハバタクカミ / オーガポン / サーフゴー / ウーラオス / ガチグマ</p>
            </button>
            <button 
              onClick={() => onLoadParty('party-2')}
              className="w-full text-left p-4 border border-gray-200 rounded-xl hover:bg-blue-50 hover:border-blue-300 transition-colors shadow-sm bg-white"
            >
              <p className="font-bold text-gray-800">大会用 ギミック構築</p>
              <p className="text-xs text-gray-500 mt-1.5 leading-relaxed">イエッサン / グレンアルマ / テツノカシラ / 悪ウーラオス / トルネロス / ゴリランダー</p>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};