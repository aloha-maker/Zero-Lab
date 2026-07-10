// frontend/features/bulids/components/AddPokemonModal.tsx
'use client';

import React, { useState, useRef, useEffect, useMemo } from 'react';
import { PokemonInfo } from '../../pokedex/types';
import PokemonSearchForm from '../../pokedex/components/PokemonSearchForm';
import { useTrainedList } from '@/features/bulids/hooks/useTrainedList';
import type { PokemonBuildResponse } from '@/features/bulids/types';

interface AddPokemonModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSearchSuccess: (data: PokemonInfo) => void;
  onSavedSelect: (build: PokemonBuildResponse) => void;
}

export const AddPokemonModal: React.FC<AddPokemonModalProps> = ({ 
  isOpen, 
  onClose, 
  onSearchSuccess, 
  onSavedSelect 
}) => {
  const { builds, errorMsg } = useTrainedList();
  
  const [filterQuery, setFilterQuery] = useState("");
  const [isSuggestOpen, setIsSuggestOpen] = useState(false);
  const suggestRef = useRef<HTMLDivElement>(null);

  const filteredBuilds = useMemo(() => {
    if (!filterQuery) return builds;
    return builds.filter(b => 
      (b.nickname && b.nickname.includes(filterQuery)) || 
      b.pokemon_name.includes(filterQuery)
    );
  }, [builds, filterQuery]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (suggestRef.current && !suggestRef.current.contains(event.target as Node)) {
        setIsSuggestOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      {/* ★ 変更: overflow-hidden を overflow-visible に変更し、max-h を削除してドロップダウンの浮き出しを許可 */}
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-visible animate-in fade-in zoom-in-95 duration-200 flex flex-col">
        
        {/* ★ 変更: ヘッダーの背景色が角丸からはみ出さないよう rounded-t-2xl を追加 */}
        <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-gray-50 flex-shrink-0 rounded-t-2xl">
          <h3 className="font-bold text-gray-800 text-lg flex items-center gap-2">
            <span role="img" aria-label="monster-ball">🔴</span> ポケモンをパーティに追加
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1">
            <span role="img" aria-label="close">✖️</span>
          </button>
        </div>
        
        {/* ★ 変更: 下部のパディングを pb-16 に広げ、overflow-visible に設定 */}
        <div className="p-6 pb-16 space-y-6 overflow-visible flex-1">
          {/* ① 検索フォームセクション */}
          <div className="relative z-20">
            <label className="block text-sm font-bold text-gray-700 mb-2">① 新しく検索して育成する</label>
            <PokemonSearchForm
              onSearchStart={() => console.log('検索を開始します...')}
              onSearchSuccess={(data) => {
                onSearchSuccess(data);
                onClose();
              }}
              onSearchError={(msg) => alert(`エラー: ${msg}`)}
            />
            <p className="text-xs text-gray-500 mt-2">種族値などの基本データを取得して新規フォームを開きます。</p>
          </div>

          <div className="relative py-2">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-400 font-medium">または</span>
            </div>
          </div>

          {/* ② 登録済みサジェストセクション */}
          <div className="relative z-10" ref={suggestRef}>
            <label className="block text-sm font-bold text-gray-700 mb-2">② 登録済みのポケモンから選ぶ</label>
            
            {errorMsg ? (
              <p className="text-red-500 text-sm">{errorMsg}</p>
            ) : (
              <div className="w-full relative">
                <div className="flex items-center w-full relative">
                  <svg
                    className="absolute left-3 h-4 w-4 text-slate-500 pointer-events-none"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35m1.35-5.65a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>

                  <input
                    type="text"
                    value={filterQuery}
                    onChange={(e) => {
                      setFilterQuery(e.target.value);
                      setIsSuggestOpen(true);
                    }}
                    onFocus={() => setIsSuggestOpen(true)}
                    placeholder="育成済みのポケモン名で検索..."
                    className="w-full pl-9 pr-9 py-2.5 bg-slate-950 border border-slate-800 rounded-lg focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none text-sm text-slate-100 placeholder-slate-600 transition-all"
                  />

                  {filterQuery && (
                    <button
                      type="button"
                      onClick={() => {
                        setFilterQuery("");
                        setIsSuggestOpen(false);
                      }}
                      className="absolute right-2.5 h-5 w-5 flex items-center justify-center rounded-full text-slate-500 hover:text-slate-200 hover:bg-slate-800 transition-colors"
                      aria-label="検索欄をクリア"
                    >
                      <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  )}
                </div>

                {isSuggestOpen && (
                  <ul className="absolute z-30 w-full mt-1 bg-slate-900 border border-slate-700 rounded-lg shadow-xl max-h-48 overflow-y-auto">
                    {filteredBuilds.length > 0 ? (
                      filteredBuilds.map((build, index) => (
                        <li 
                          key={build.id || index}
                          onClick={() => {
                            onSavedSelect(build);
                            setIsSuggestOpen(false);
                            onClose();
                          }}
                          className="px-4 py-2 hover:bg-slate-800 cursor-pointer flex items-center justify-between border-b border-slate-800/50 last:border-0 transition-colors"
                        >
                          <div className="flex flex-col">
                            <span className="text-sm font-medium text-slate-200">
                              {build.nickname || build.pokemon_name}
                            </span>
                            {build.nickname && (
                              <span className="text-[10px] text-slate-500">{build.pokemon_name}</span>
                            )}
                          </div>
                          <div className="flex flex-col items-end gap-1">
                            <span className="text-[10px] font-bold px-1.5 py-0.5 bg-slate-800 text-slate-300 rounded border border-slate-700">
                              {build.tera_type}
                            </span>
                            <span className="text-[10px] text-slate-400">
                              持: {build.item || 'なし'}
                            </span>
                          </div>
                        </li>
                      ))
                    ) : (
                      <li className="px-4 py-3 text-sm text-slate-500 text-center">
                        一致する育成済みポケモンがいません。
                      </li>
                    )}
                  </ul>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};