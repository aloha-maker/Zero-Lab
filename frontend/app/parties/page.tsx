import Link from 'next/link';
import { PartyList } from '@/features/parties/components/PartyList';

export default function PartyListPage() {
    return (
        <div className="p-8">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">パーティ一覧</h1>
                <Link href="/parties/new" className="bg-green-600 px-4 py-2 rounded">
                    新規作成
                </Link>
            </div>

            {/* Hookの呼び出しと一覧の描画はすべてこのコンポーネント内部で行われる */}
            <PartyList />
        </div>
    );
}