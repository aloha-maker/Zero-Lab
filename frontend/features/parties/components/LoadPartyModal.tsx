// frontend/features/parties/components/LoadPartyModal.tsx
'use client';

import React, { useState, useEffect } from 'react';
// ★ API連携が完了するまでコメントアウトしておきます
// import { useParties } from '../hooks/useParties'; 
import type { PartyResponse } from '../types';

interface LoadPartyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoadParty: (party: PartyResponse) => void;
}

// ==========================================
// ★ フロントエンド確認用のモックデータ
// ==========================================
const MOCK_PARTIES: PartyResponse[] = [
  {
    id: 'mock-1',
    name: 'シーズン15 スタンダード',
    description: '対面構築。基本選出はカイリュー＋ハバタクカミ＋ウーラオス。',
    members: [
      {
        pokemon_id: 149,
        pokemon_name: 'カイリュー',
        nickname: 'ハチマキ枠',
        item: 'こだわりハチマキ',
        ability: 'マルチスケイル',
        tera_type: 'ノーマル',
        nature: 'いじっぱり',
        moves: ['しんそく', 'げきりん', 'じしん', 'けたぐり'],
        evs: { H: 4, A: 252, B: 0, C: 0, D: 0, S: 252 },
        ivs: { H: 31, A: 31, B: 31, C: 31, D: 31, S: 31 },
        memo: '初手テラスしんそくで荒らすか、裏からスイーパーとして出す。'
      },
      {
        pokemon_id: 987,
        pokemon_name: 'ハバタクカミ',
        nickname: 'エナジーカミ',
        item: 'ブーストエナジー',
        ability: 'こだいかっせい',
        tera_type: 'フェアリー',
        nature: 'おくびょう',
        moves: ['ムーンフォース', 'シャドーボール', 'めいそう', 'いたみわけ'],
        evs: { H: 228, A: 0, B: 252, C: 4, D: 4, S: 20 },
        ivs: { H: 31, A: 0, B: 31, C: 31, D: 31, S: 31 },
        memo: 'Sエナジー発動のHBベース。物理対面で強引にめいそうを積む。'
      },
      {
        pokemon_id: 892,
        pokemon_name: 'ウーラオス（れんげきのかた）',
        nickname: 'スカーフラオス',
        item: 'こだわりスカーフ',
        ability: 'ふかしのこぶし',
        tera_type: 'みず',
        nature: 'いじっぱり',
        moves: ['すいりゅうれんだ', 'インファイト', 'アクアジェット', 'とんぼがえり'],
        evs: { H: 4, A: 252, B: 0, C: 0, D: 0, S: 252 },
        ivs: { H: 31, A: 31, B: 31, C: 31, D: 31, S: 31 },
        memo: '初手に出してとんぼがえりで有利対面を作るか、上から制圧する。'
      },
      {
        pokemon_id: 1000,
        pokemon_name: 'サーフゴー',
        nickname: 'メガネサフゴ',
        item: 'こだわりメガネ',
        ability: 'おうごんのからだ',
        tera_type: 'はがね',
        nature: 'ひかえめ',
        moves: ['ゴールドラッシュ', 'シャドーボール', 'トリック', 'じこさいせい'],
        evs: { H: 244, A: 0, B: 12, C: 252, D: 0, S: 0 },
        ivs: { H: 31, A: 0, B: 31, C: 31, D: 31, S: 31 },
        memo: 'サイクル破壊枠。受けループや変化技主体の相手にトリックを刺す。'
      },
      {
        pokemon_id: 1011,
        pokemon_name: 'オーガポン',
        nickname: '炎ポン',
        item: 'かまどのおめん',
        ability: 'かたやぶり',
        tera_type: 'ほのお',
        nature: 'ようき',
        moves: ['ツタこんぼう', 'ウッドホーン', 'でんこうせっか', 'つるぎのまい'],
        evs: { H: 4, A: 252, B: 0, C: 0, D: 0, S: 252 },
        ivs: { H: 31, A: 31, B: 31, C: 31, D: 31, S: 31 },
        memo: 'テラス時の超火力アタッカー兼、サーフゴーやハッサムへの牽制。'
      },
      {
        pokemon_id: 901,
        pokemon_name: 'ガチグマ（アカツキ）',
        nickname: 'チョッキグマ',
        item: 'とつげきチョッキ',
        ability: 'しんがん',
        tera_type: 'ノーマル',
        nature: 'ひかえめ',
        moves: ['ブラッドムーン', 'だいちのちから', 'しんくうは', 'ハイパーボイス'],
        evs: { H: 244, A: 0, B: 4, C: 252, D: 4, S: 4 },
        ivs: { H: 31, A: 0, B: 31, C: 31, D: 31, S: 31 },
        memo: '特殊方面の撃ち合いに強い枠。対特殊アタッカーへのクッションにもなる。'
      }
    ] as any,
  },
  {
    id: 'mock-2',
    name: 'トリル展開（ガチグマ軸）',
    description: 'クレセリアでトリックルームを展開し、ガチグマ（アカツキ）で全抜きを狙う構成。',
    members: [] as any, 
  },
  {
    id: 'mock-3',
    name: '晴れ展開',
    description: 'コータスからの展開を主軸にしたパーティ。',
    members: [] as any,
  }
];

export const LoadPartyModal: React.FC<LoadPartyModalProps> = ({ isOpen, onClose, onLoadParty }) => {
  const [searchTerm, setSearchTerm] = useState('');
  
  // ==========================================
  // ★ APIの代わりにモックデータと固定のステータスを使用
  // ==========================================
  // const { parties, isLoading, error } = useParties();
  const parties = MOCK_PARTIES;
  const isLoading = false;
  const error = null;

  // 検索文字列に基づいてパーティをフィルタリング[cite: 8]
  const filteredParties = parties.filter(party => 
    party.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // モーダルが閉じた時に状態をリセットする[cite: 8]
  useEffect(() => {
    if (!isOpen) {
      setSearchTerm('');
    }
  }, [isOpen]);

  if (!isOpen) return null; //[cite: 8]

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      {/* overflow-visibleに変更し、リストボックスが親要素の外にはみ出せるようにする[cite: 8] */}
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg flex flex-col animate-in fade-in zoom-in-95 duration-200 overflow-visible">
        
        {/* ヘッダー[cite: 8] */}
        <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-gray-50 rounded-t-2xl">
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
        
        <div className="p-6">
          {/* 検索入力とサジェストリストボックス[cite: 8] */}
          <div className="relative">
            <label className="block text-sm font-bold text-gray-700 mb-2">パーティ名で検索</label>
            <input 
              type="text" 
              placeholder="シーズン10用..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 transition-shadow"
              role="combobox"
              aria-expanded={isOpen}
              aria-controls="party-listbox"
            />

            {/* サジェスト表示用リストボックス[cite: 8] */}
            <div 
              id="party-listbox"
              role="listbox"
              className="absolute z-10 w-full mt-2 bg-white border border-gray-200 rounded-xl shadow-lg max-h-72 overflow-y-auto custom-scrollbar"
            >
              {error ? (
                <div className="text-red-500 text-sm font-bold p-4 text-center">
                  {error}
                </div>
              ) : isLoading ? (
                <div className="flex justify-center items-center py-8">
                  <div className="animate-spin h-6 w-6 border-4 border-blue-500 border-t-transparent rounded-full" />
                </div>
              ) : filteredParties.length > 0 ? (
                <ul className="py-2">
                  {filteredParties.map((party) => (
                    <li 
                      key={party.id}
                      role="option"
                      aria-selected="false"
                      onClick={() => onLoadParty(party)}
                      className="px-4 py-3 hover:bg-blue-50 cursor-pointer border-b border-gray-50 last:border-0 group transition-colors flex justify-between items-center"
                    >
                      <div>
                        <h4 className="font-bold text-gray-800 group-hover:text-blue-600 transition-colors">
                          {party.name}
                        </h4>
                        {party.description && (
                          <p className="text-xs text-gray-500 mt-1 line-clamp-1">{party.description}</p>
                        )}
                      </div>
                      <div className="text-xs text-gray-400 font-medium bg-gray-100 group-hover:bg-blue-100 group-hover:text-blue-600 px-2 py-1 rounded-md transition-colors">
                        {party.members?.length || 0} / 6 匹
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <span role="img" aria-label="ghost" className="text-2xl mb-2 block">👻</span>
                  一致するパーティが見つかりません
                </div>
              )}
            </div>
          </div>
          
        </div>
      </div>
    </div>
  );
};