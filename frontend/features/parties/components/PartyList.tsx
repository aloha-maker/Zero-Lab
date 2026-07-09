// frontend/features/parties/components/PartyList.tsx
'use client';

import Link from 'next/link';
import { useParties } from '../hooks/useParties';

export const PartyList = () => {
    // コンポーネント内部で状態とロジックを呼び出す
    const { parties, handleDelete } = useParties();

    return (
        <div className="grid gap-4">
            {parties.map((party) => (
                <div key={party.id} className="border p-4 rounded flex justify-between bg-gray-900">
                    <div>
                        <h2 className="text-xl font-bold">{party.name}</h2>
                        <p className="text-sm text-gray-400">{party.description}</p>
                        {/* ここに6匹のアイコンを並べる */}
                    </div>
                    <div className="flex gap-2">
                        <Link href={`/parties/${party.id}/edit`} className="text-blue-400">
                            編集
                        </Link>
                        <button onClick={() => handleDelete(party.id!)} className="text-red-400">
                            削除
                        </button>
                    </div>
                </div>
            ))}
            
            {/* データが空の場合のフォールバック表示を入れておくと親切です */}
            {parties.length === 0 && (
                <p className="text-gray-400">パーティが登録されていません。</p>
            )}
        </div>
    );
};