// frontend/app/parties/[id]/edit/page.tsx
'use client';

import { useParams } from 'next/navigation';
import PartyForm from '@/features/parties/components/PartyForm';
import { usePartyDetail } from '@/features/parties/hooks/usePartyDetail';

export default function EditPartyPage() {
    const { id } = useParams();
    const partyId = Array.isArray(id) ? id[0] : id;

    const { party, isLoading, errorMsg } = usePartyDetail(partyId);

    if (errorMsg) return <div className="text-red-400 p-8">{errorMsg}</div>;
    if (isLoading || !party) return <div className="text-white p-8">読み込み中...</div>;

    return (
        <main className="p-8">
            <h1 className="text-2xl font-bold mb-8 text-center text-white">パーティ編集</h1>
            <PartyForm initialData={party} isEdit={true} />
        </main>
    );
}