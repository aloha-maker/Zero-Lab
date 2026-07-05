'use client';

import React, { useState, useEffect } from 'react';
import { TrainedPokemon } from '../../bulids/types/mock';

interface StatFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialData: Partial<TrainedPokemon> | null;
  onSave: (pokemon: TrainedPokemon) => void;
}

export const StatFormModal: React.FC<StatFormModalProps> = ({ isOpen, onClose, initialData, onSave }) => {
  const [formData, setFormData] = useState<Partial<TrainedPokemon>>({});

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    }
  }, [initialData]);

  if (!isOpen || !initialData) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData as TrainedPokemon);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-200">
        <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-gray-50 sticky top-0 z-10">
          <h3 className="font-bold text-gray-800 text-lg flex items-center gap-2">
            <span role="img" aria-label="memo">📝</span> 育成データの入力
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1">
            <span role="img" aria-label="close">✖️</span>
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="flex gap-4 items-center">
            <img src={formData.imageUrl} alt={formData.species} className="w-16 h-16 object-contain bg-gray-50 rounded-full border border-gray-200" />
            <div>
              <h4 className="font-bold text-xl">{formData.species}</h4>
              <p className="text-xs text-gray-500">基本ステータスを元に育成情報を入力してください</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">ニックネーム</label>
              <input 
                type="text" 
                value={formData.nickname || ''} 
                onChange={e => setFormData({...formData, nickname: e.target.value})}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
                placeholder="任意"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">持ち物</label>
              <input 
                type="text" 
                value={formData.item || ''} 
                onChange={e => setFormData({...formData, item: e.target.value})}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">特性</label>
              <input 
                type="text" 
                value={formData.ability || ''} 
                onChange={e => setFormData({...formData, ability: e.target.value})}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
             <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">テラスタイプ</label>
              <input 
                type="text" 
                value={formData.teraType || ''} 
                onChange={e => setFormData({...formData, teraType: e.target.value})}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
          </div>

          <div>
             <label className="block text-sm font-bold text-gray-700 mb-1">技構成</label>
             <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {[0,1,2,3].map(index => (
                    <input 
                        key={index}
                        type="text"
                        value={formData.moves?.[index] || ''}
                        onChange={e => {
                            const newMoves = [...(formData.moves || ['', '', '', ''])];
                            newMoves[index] = e.target.value;
                            setFormData({...formData, moves: newMoves});
                        }}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
                        placeholder={`技${index + 1}`}
                    />
                ))}
             </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">育成メモ</label>
            <textarea 
                value={formData.notes || ''} 
                onChange={e => setFormData({...formData, notes: e.target.value})}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 min-h-[4rem]"
                placeholder="調整意図など"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
            <button type="button" onClick={onClose} className="px-4 py-2 text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg font-bold">
              キャンセル
            </button>
            <button type="submit" className="px-4 py-2 text-white bg-blue-600 hover:bg-blue-700 rounded-lg font-bold shadow-sm">
              パーティに追加
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};