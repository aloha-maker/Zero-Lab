'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface Build {
    id: string;
    pokemon_id: number;
    pokemon_name: string;
}

interface PartyMember {
    build_id: string;
    slot_index: number;
}

interface PartyFormProps {
    initialData?: {
        id?: string;
        name: string;
        description: string;
        members: PartyMember[];
    };
    isEdit?: boolean;
}

export default function PartyForm({ initialData, isEdit }: PartyFormProps) {
    const router = useRouter();
    const [name, setName] = useState(initialData?.name || '');
    const [description, setDescription] = useState(initialData?.description || '');
    const [selectedBuilds, setSelectedBuilds] = useState<(string | null)[]>(() => {
        // 1. まず「手紙（メンバー一覧）」がどこにあるか特定する
        //    DBからの取得時は party_members、フォーム入力時は members
        const mList = initialData?.members || (initialData as any)?.party_members || [];

        // 2. 6枠の配列を作成し、該当する slot_index があれば build_id を入れる
        return Array(6).fill(null).map((_, i) => {
            const slotNumber = i + 1;
            const found = mList.find((m: any) => m.slot_index === slotNumber);
            return found ? found.build_id : null;
        });
    });
    const [availableBuilds, setAvailableBuilds] = useState<Build[]>([]);

    // 育成済みポケモン一覧を取得
    useEffect(() => {
        fetch('http://localhost:8000/api/builds') // 育成済み一覧を取得するAPI（別途実装前提）
            .then(res => res.json())
            .then(data => setAvailableBuilds(data.data || []));
    }, []);


    const handleSave = async () => {
        const members = selectedBuilds
            .map((id, index) => (id ? { build_id: id, slot_index: index + 1 } : null))
            .filter(m => m !== null);

        const url = isEdit ? `http://localhost:8000/api/parties/${initialData?.id}` : 'http://localhost:8000/api/parties';
        const method = isEdit ? 'PUT' : 'POST';

        const res = await fetch(url, {
            method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, description, members }),
        });

        if (res.ok) {
            router.push('/parties');
            router.refresh();
        } else {
            alert('保存に失敗しました');
        }
    };

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
                            {build ? (
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
                                onChange={(e) => {
                                    const newSelected = [...selectedBuilds];
                                    newSelected[index] = e.target.value || null;
                                    setSelectedBuilds(newSelected);
                                }}
                                className="mt-2 text-xs bg-gray-800 p-1 w-full"
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
                <button onClick={() => router.back()} className="flex-1 p-2 border border-gray-600 rounded">キャンセル</button>
                <button onClick={handleSave} className="flex-1 p-2 bg-blue-600 rounded font-bold">
                    {isEdit ? '更新する' : '登録する'}
                </button>
            </div>
        </div>
    );
}