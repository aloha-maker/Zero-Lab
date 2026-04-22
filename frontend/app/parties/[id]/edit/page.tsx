'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import PartyForm from '@/components/PartyForm';

export default function EditPartyPage() {
    const { id } = useParams();
    const [initialData, setInitialData] = useState(null);

    useEffect(() => {
        // 既存のパーティ情報を取得
        fetch(`http://localhost:8000/api/parties/${id}`)
            .then(res => res.json())
            .then(data => {
                if (data.status === 'success') {
                    setInitialData(data.data);
                }
            });
    }, [id]);

    if (!initialData) return <div className="text-white p-8">読み込み中...</div>;

    return (
        <main className="p-8">
            <h1 className="text-2xl font-bold mb-8 text-center text-white">パーティ編集</h1>
            <PartyForm initialData={initialData} isEdit={true} />
        </main>
    );
}