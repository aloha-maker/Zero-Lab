import { TrainedList } from '@/features/parties/components/menberList'

export default function TrainedPage() {
  return (
    <main className="min-h-screen bg-slate-100 text-gray-800 font-sans p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* featuresディレクトリで定義したリストコンポーネントを呼び出す */}
        <TrainedList />
      </div>
    </main>
  );
}