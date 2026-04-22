import PartyForm from '@/components/PartyForm';

export default function NewPartyPage() {
    return (
        <main className="p-8">
            <h1 className="text-2xl font-bold mb-8 text-center text-white">パーティ新規作成</h1>
            <PartyForm />
        </main>
    );
}