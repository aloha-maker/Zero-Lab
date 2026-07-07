// frontend/features/parties/components/AddPokemonModal.tsx
'use client';

import React, { useState, useMemo, useRef, useEffect } from 'react';
import { usePokemonMaster } from '../../pokedex/hooks/usePokemonMaster';
import { usePokemonSearchForm } from '../../pokedex/hooks/usePokemonSearchForm';
import { PokemonInfo } from '../../pokedex/types';


interface AddPokemonModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSearchSuccess: (data: PokemonInfo) => void;
    onLoadSaved: () => void;
  }
  
  export const AddPokemonModal: React.FC<AddPokemonModalProps> = ({ isOpen, onClose, onSearchSuccess, onLoadSaved }) => {
    // ① マスターデータの取得
    const { candidates, isMasterLoading } = usePokemonMaster();
    
    // ② 検索フォーム状態の管理
    const { searchQuery, setSearchQuery, loading, handleSearch } = usePokemonSearchForm({
      onSearchStart: () => console.log('検索を開始します...'),
      onSearchSuccess: (data) => {
        onSearchSuccess(data);
        onClose(); // 成功したらモーダルを閉じる
      },
      onSearchError: (msg) => alert(`エラー: ${msg}`)
    });
  
    const [isSuggestOpen, setIsSuggestOpen] = useState(false);
    const suggestRef = useRef<HTMLDivElement>(null);
  
    // 入力値に基づいて候補をフィルタリング（上位5件）
    const filteredCandidates = useMemo(() => {
      if (!searchQuery) return [];
      return candidates
        .filter(c => c.jaName.includes(searchQuery) || c.name.includes(searchQuery))
        .slice(0, 5);
    }, [searchQuery, candidates]);
  
    // モーダル外クリックでサジェストを閉じる
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
              
              {/* usePokemonSearchForm の handleSearch を onSubmit で発火させる */}
              <form onSubmit={handleSearch} className="flex gap-2 relative">
                <div className="relative flex-1" ref={suggestRef}>
                  <input 
                    type="text" 
                    placeholder={isMasterLoading ? "マスターデータ読込中..." : "ポケモン名を入力..."}
                    value={searchQuery}
                    disabled={isMasterLoading || loading}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      setIsSuggestOpen(true);
                    }}
                    onFocus={() => setIsSuggestOpen(true)}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 disabled:bg-gray-100 disabled:cursor-not-allowed"
                  />
                  
                  {/* サジェスト（候補）リストの表示 */}
                  {isSuggestOpen && filteredCandidates.length > 0 && (
                    <ul className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-xl max-h-48 overflow-y-auto">
                      {filteredCandidates.map(pokemon => (
                        <li 
                          key={pokemon.id}
                          onClick={() => {
                            // サジェストをクリックしたら入力欄に日本語名をセットしてサジェストを閉じる
                            setSearchQuery(pokemon.jaName);
                            setIsSuggestOpen(false);
                          }}
                          className="px-4 py-2 hover:bg-blue-50 cursor-pointer flex items-center gap-3 border-b border-gray-50 last:border-0"
                        >
                          <img src={pokemon.imageUrl} alt={pokemon.jaName} className="w-8 h-8 object-contain" />
                          <span className="text-sm font-bold text-gray-700">{pokemon.jaName}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
                <button 
                  type="submit"
                  disabled={!searchQuery || isMasterLoading || loading}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-bold transition-colors shadow-sm disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {loading ? <span className="animate-spin">⏳</span> : <span>🔍</span>}
                  検索
                </button>
              </form>
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