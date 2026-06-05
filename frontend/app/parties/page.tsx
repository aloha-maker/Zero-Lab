'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import type { PartyResponse } from '@/app/types/api';

export default function PartyListPage() {
    const [parties, setParties] = useState<PartyResponse[]>([]);

    // パーティ一覧を取得
    const fetchParties = async () => {
        try {
            // ポート番号を含めたフルパスで取得
            const res = await fetch('http://localhost:8000/api/v1/parties/');
            const json = await res.json();

            console.log("Fetched Data:", json); // デバッグ用に確認

            if (json.status === "success" && Array.isArray(json.data)) {
                setParties(json.data);
            } else {
                setParties([]); // 念のため空配列で初期化
            }
        } catch (error) {
            console.error("Failed to fetch parties:", error);
            setParties([]);
        }
    };

    useEffect(() => { fetchParties(); }, []);

    const handleDelete = async (id: string) => {
        if (!confirm("このパーティを削除しますか？")) return;
        await fetch(`http://localhost:8000/api/v1/parties/${id}`, { method: 'DELETE' });
        fetchParties();
    };

    return (
        <div className="p-8">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">パーティ一覧</h1>
                <Link href="/parties/new" className="bg-green-600 px-4 py-2 rounded">新規作成</Link>
            </div>

            <div className="grid gap-4">
                {parties.map((party) => (
                    <div key={party.id} className="border p-4 rounded flex justify-between bg-gray-900">
                        <div>
                            <h2 className="text-xl font-bold">{party.name}</h2>
                            <p className="text-sm text-gray-400">{party.description}</p>
                            {/* ここに6匹のアイコンを並べる */}
                        </div>
                        <div className="flex gap-2">
                            <Link href={`/parties/${party.id}/edit`} className="text-blue-400">編集</Link>
                            <button onClick={() => handleDelete(party.id!)} className="text-red-400">削除</button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}