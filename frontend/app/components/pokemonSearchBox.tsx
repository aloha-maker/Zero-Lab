import React, { useState, useEffect, useRef } from 'react';
import {PokemonStatusState} from './pokemonBuildingForm'

// ==========================================
// POKEMON SEARCH COMPONENT
// ==========================================

interface PokemonSearchBoxProps {
  // 検索対象となる育成済みポケモンのマスターデータ、または保存済みリスト
  pokemonList: PokemonStatusState[];
  // ユーザーが選択したときに親へデータを渡すコールバック
  onSelect: (pokemon: PokemonStatusState) => void;
}

export function PokemonSearchBox({ pokemonList, onSelect }: PokemonSearchBoxProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [suggestions, setSuggestions] = useState<PokemonStatusState[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  // 入力値に応じてリストをフィルタリング
  useEffect(() => {
    if (searchTerm.trim() === '') {
      setSuggestions([]);
      return;
    }

    const filtered = pokemonList.filter((pokemon) =>
      pokemon.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setSuggestions(filtered);
  }, [searchTerm, pokemonList]);

  // ボックスの外側をクリックしたらサジェストを閉じる処理
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (pokemon: PokemonStatusState) => {
    onSelect(pokemon);
    setSearchTerm(pokemon.name); // ボックスに名前をセット
    setIsOpen(false);
  };

  return (
    <div ref={wrapperRef} className="relative w-full max-w-md mb-4 z-50">
      <div className="relative">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          className="w-full bg-slate-900 border border-slate-800 focus:border-indigo-500 rounded-xl px-4 py-2.5 text-sm font-bold text-slate-100 focus:outline-none shadow-xl placeholder-slate-500 transition"
          placeholder="育成済みポケモンを検索..."
        />
        {searchTerm && (
          <button
            onClick={() => { setSearchTerm(''); setSuggestions([]); }}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-500 hover:text-slate-300 px-1"
          >
            クリア
          </button>
        )}
      </div>

      {/* サジェストドロップダウン */}
      {isOpen && suggestions.length > 0 && (
        <ul className="absolute left-0 right-0 mt-2 bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-2xl max-h-60 overflow-y-auto divide-y divide-slate-800/60">
          {suggestions.map((pokemon, index) => (
            <li key={index}>
              <button
                type="button"
                onClick={() => handleSelect(pokemon)}
                className="w-full text-left px-4 py-3 hover:bg-slate-800/60 transition flex justify-between items-center"
              >
                <div className="flex items-center gap-2">
                  <span className="font-bold text-sm text-slate-200">{pokemon.name}</span>
                  <span className="text-[10px] font-extrabold px-1.5 py-0.5 bg-slate-800 text-slate-400 rounded border border-slate-700">
                    Lv.{pokemon.level}
                  </span>
                </div>
                <span className="text-xs text-indigo-400 font-semibold">{pokemon.nature}</span>
              </button>
            </li>
          ))}
        </ul>
      )}

      {isOpen && searchTerm && suggestions.length === 0 && (
        <div className="absolute left-0 right-0 mt-2 bg-slate-900 border border-slate-800 rounded-xl p-4 text-center text-xs font-bold text-slate-500 shadow-2xl">
          一致するポケモンが見つかりません
        </div>
      )}
    </div>
  );
}