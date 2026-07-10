// frontend/features/parties/components/PartyForm.tsx
'use client';

import type { PartyResponse } from '../types';
import { usePartyForm } from '../hooks/usePartyForm';

interface PartyFormProps {
    initialData?: PartyResponse;
    isEdit?: boolean;
}

export default function PartyForm({ initialData, isEdit }: PartyFormProps) {
    const {
        name,
        setName,
        description,
        setDescription,
        selectedBuilds,
        handleBuildSelect,
        availableBuilds,
        isLoadingBuilds,
        isSaving,
        handleSave,
        handleCancel
    } = usePartyForm(initialData, isEdit);

    return (
        <div className="space-y-6 max-w-4xl mx-auto p-4 text-white">
            <div className="space-y-2">
                <label className="block font-bold">パーティ名</label>
                <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full p-2 bg-gray-800 border border-gray-700 rounded"
                    placeholder="例: レギュレーションH 構築案"
                />
            </div>

            <div className="space-y-2">
                <label className="block font-bold">説明 / メモ</label>
                <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full p-2 bg-gray-800 border border-gray-700 rounded"
                    rows={3}
                />
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {selectedBuilds.map((selectedId, index) => {
                    const build = availableBuilds.find(b => b.id === selectedId);
                    return (
                        <div key={index} className="border border-gray-700 p-4 rounded bg-gray-900 flex flex-col items-center">
                            <span className="text-xs text-gray-500 mb-2">Slot {index + 1}</span>
                            
                            {isLoadingBuilds ? (
                                <div className="w-20 h-20 mb-2 flex items-center justify-center text-gray-500">...</div>
                            ) : build ? (
                                <>
                                    <img
                                        src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${build.pokemon_id}.png`}
                                        alt={build.pokemon_name}
                                        className="w-20 h-20"
                                    />
                                    <p className="text-sm font-bold">{build.pokemon_name}</p>
                                </>
                            ) : (
                                <div className="w-20 h-20 bg-gray-800 rounded-full mb-2 flex items-center justify-center text-gray-500">?</div>
                            )}

                            <select
                                value={selectedId || ''}
                                onChange={(e) => handleBuildSelect(index, e.target.value)}
                                className="mt-2 text-xs bg-gray-800 p-1 w-full"
                                disabled={isLoadingBuilds}
                            >
                                <option value="">選択してください</option>
                                {availableBuilds.map(b => (
                                    <option key={b.id} value={b.id}>{b.pokemon_name}</option>
                                ))}
                            </select>
                        </div>
                    );
                })}
            </div>

            <div className="flex gap-4 pt-6">
                <button 
                    onClick={handleCancel} 
                    className="flex-1 p-2 border border-gray-600 rounded"
                    disabled={isSaving}
                >
                    キャンセル
                </button>
                <button 
                    onClick={handleSave} 
                    className="flex-1 p-2 bg-blue-600 rounded font-bold disabled:bg-blue-800"
                    disabled={isSaving}
                >
                    {isSaving ? '保存中...' : (isEdit ? '更新する' : '登録する')}
                </button>
            </div>
        </div>
    );
}