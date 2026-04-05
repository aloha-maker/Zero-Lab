export default function Home() {
  return (
    <main className="min-h-screen bg-gray-50 p-8 font-sans">
      <div className="max-w-5xl mx-auto">
        <header className="mb-10 text-center">
          <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">Zero-Lab</h1>
          <p className="text-gray-500 mt-2 font-medium">Pokémon Battle Assist AI</p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* 左側：画像アップロードとプレビューエリア */}
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-200 flex flex-col items-center justify-center min-h-[350px]">
            <div className="text-gray-300 mb-4">
              {/* ダミーの画像アイコン */}
              <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
            </div>
            <p className="text-sm text-gray-500 mb-6 font-medium">対戦画面のスクリーンショットをアップロード</p>
            <button className="bg-blue-600 text-white px-8 py-3 rounded-full font-bold hover:bg-blue-700 transition shadow-md">
              画像を選択
            </button>
          </div>

          {/* 右側：解析結果とAIの提案エリア */}
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-200 flex flex-col">
            <h2 className="text-xl font-bold text-gray-800 mb-4 border-b-2 border-gray-100 pb-3">AI戦術アドバイス</h2>
            <div className="flex-1 flex items-center justify-center text-gray-400 text-sm bg-gray-50 rounded-xl border border-dashed border-gray-200">
              <p>画像をアップロードすると、ここにOCR解析結果とAIの提案が表示されます。</p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}