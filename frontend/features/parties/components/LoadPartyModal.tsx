// frontend/features/parties/components/LoadPartyModal.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { PartyResponse } from '@/features/parties/types';

interface LoadPartyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoadParty: (partyId: string) => void;
}

export const LoadPartyModal: React.FC<LoadPartyModalProps> = ({ isOpen, onClose, onLoadParty }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [parties, setParties] = useState<PartyResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // APIからパーティ一覧を取得する関数
  const fetchParties = async (query: string = '') => {
    setLoading(true);
    setError(null);
    try {
      // 検索クエリが存在する場合はパラメータを付与（API側の実装に合わせて ?name= 等に変更してください）
      const url = query 
        ? `/api/v1/parties/?name=${encodeURIComponent(query)}`
        : '/api/v1/parties/';
        
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error('パーティ情報の取得に失敗しました。');
      }
      
      const data: PartyResponse[] = await response.json();
      setParties(data);
    } catch (err: any) {
      console.error(err);
      setError(err.message || '予期せぬエラーが発生しました。');
    } finally {
      setLoading(false);
    }
  };

  // モーダルが開かれた時に初期データをロードする
  useEffect(() => {
    if (isOpen) {
      fetchParties();
    } else {
      // 閉じた時に状態をリセット
      setSearchTerm('');
      setParties([]);
      setError(null);
    }
  }, [isOpen]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault(); // Enterキーによる画面リロードを防ぐ
    fetchParties(searchTerm);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[85vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* ヘッダー */}
        <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-gray-50 flex-shrink-0">
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
        
        <div className="p-6 flex flex-col gap-6 overflow-hidden">
          
          {/* パーティ検索フォーム */}
          <form onSubmit={handleSearch} className="flex-shrink-0">
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
                type="submit"
                disabled={loading}
                className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg font-bold transition-colors whitespace-nowrap shadow-sm min-w-[80px]"
              >
                {loading ? '検索中' : '検索'}
              </button>
            </div>
          </form>

          {/* 検索結果リスト */}
          <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
            {error ? (
              <div className="text-red-500 text-sm font-bold p-4 bg-red-50 rounded-lg text-center">
                {error}
              </div>
            ) : loading && parties.length === 0 ? (
              <div className="flex justify-center items-center py-12">
                <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full" />
              </div>
            ) : parties.length > 0 ? (
              <ul className="space-y-3">
                {parties.map((party) => (
                  <li 
                    key={party.id}
                    onClick={() => onLoadParty(party.id)}
                    className="p-4 border border-gray-200 rounded-xl hover:border-blue-400 hover:shadow-md transition-all bg-white group flex justify-between items-center cursor-pointer"
                  >
                    <div>
                      <h4 className="font-bold text-gray-800 group-hover:text-blue-600 transition-colors">
                        {party.name}
                      </h4>
                      {party.description && (
                        <p className="text-xs text-gray-500 mt-1 line-clamp-1">{party.description}</p>
                      )}
                      <div className="text-xs text-gray-400 mt-2 font-medium">
                        登録数: {party.members?.length || 0} / 6 匹
                      </div>
                    </div>
                    <button 
                      className="px-4 py-1.5 bg-gray-100 group-hover:bg-blue-100 text-gray-600 group-hover:text-blue-600 rounded-full font-bold text-sm transition-colors flex-shrink-0"
                    >
                      選択
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="text-center py-12 text-gray-500 bg-gray-50 rounded-xl border border-gray-100">
                <span role="img" aria-label="ghost" className="text-3xl mb-2 block">👻</span>
                パーティが見つかりませんでした。
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
};