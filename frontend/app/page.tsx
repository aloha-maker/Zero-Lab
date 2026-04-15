import Link from "next/link";

export default function Home() {
  return (
    <div className="space-y-8">
      <header className="mb-10 text-center">
        <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">Zero-Lab Dashboard</h1>
        <p className="text-gray-500 mt-2 font-medium">Pokémon Battle Assist AI</p>
      </header>

      {/* カードを並べるグリッド（PCでは3列、タブレットでは2列、スマホでは1列に自動調整） */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

        {/* ▼▼ 機能カード：ステータス計算（稼働中） ▼▼ */}
        <Link href="/status" className="block group h-full">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 hover:shadow-md hover:border-blue-300 transition h-full flex flex-col">
            <h2 className="text-xl font-bold text-gray-800 mb-2 group-hover:text-blue-600 transition">📊 ステータス計算</h2>
            <p className="text-sm text-gray-600 flex-grow">
              種族値・個体値・努力値から実数値を計算します。（API連携テスト済）
            </p>
            <span className="mt-4 text-xs font-bold text-blue-500 bg-blue-50 py-1 px-3 rounded-full w-fit">
              稼働中
            </span>
          </div>
        </Link>

        {/* ▼▼ 機能カード：ダメージ計算（稼働中） ▼▼ */}
        <Link href="/damage" className="block group h-full">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 hover:shadow-md hover:border-blue-300 transition h-full flex flex-col">
            <h2 className="text-xl font-bold text-gray-800 mb-2 group-hover:text-blue-600 transition">⚔️ ダメージ計算</h2>
            <p className="text-sm text-gray-600 flex-grow">
              技の威力とステータスからダメージ乱数を算出します。
            </p>
            <span className="mt-4 text-xs font-bold text-blue-500 bg-blue-50 py-1 px-3 rounded-full w-fit">
              稼働中
            </span>
          </div>
        </Link>

        {/* ▼▼ 機能カード：すばやさ計算（準備中） ▼▼ */}
        <Link href="/speed" className="block group h-full">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 hover:shadow-md hover:border-blue-300 transition h-full flex flex-col">
            <h2 className="text-xl font-bold text-gray-800 mb-2 group-hover:text-blue-600 transition">⚡ すばやさ計算</h2>
            <p className="text-sm text-gray-600 flex-grow">
              素早さの実数値を計算し、順位を自動で並び替えます。
            </p>
            <span className="mt-4 text-xs font-bold text-blue-500 bg-blue-50 py-1 px-3 rounded-full w-fit">
              稼働中
            </span>
          </div>
        </Link>

        {/* ▼▼ 機能カード：ポケモン図鑑 ▼▼ */}
        <Link href="/fetch_pokemon" className="block group h-full">
          <div className="bg-gray-50 p-6 rounded-2xl border border-gray-200 opacity-70 h-full flex flex-col">
            <h2 className="text-xl font-bold text-gray-500 mb-2">📖 ポケモン図鑑</h2>
            <p className="text-sm text-gray-500 flex-grow">
              種族値、タイプ、覚える技などの基本データを検索します。
            </p>
            <span className="mt-4 text-xs font-bold text-blue-500 bg-blue-50 py-1 px-3 rounded-full w-fit">
              稼働中
            </span>
          </div>
        </Link>

        {/* ▼▼ 今後追加予定：AI解析（準備中） ▼▼ */}
        <div className="bg-gray-50 p-6 rounded-2xl border border-gray-200 opacity-70 h-full flex flex-col">
          <h2 className="text-xl font-bold text-gray-500 mb-2">🤖 AI戦術解析 (OCR)</h2>
          <p className="text-sm text-gray-500 flex-grow">
            対戦画面の画像から相手のパーティを読み取り、AIが戦術を提案します。
          </p>
          <span className="mt-4 text-xs font-bold text-gray-500 bg-gray-200 py-1 px-3 rounded-full w-fit">
            準備中
          </span>
        </div>

      </div>
    </div>
  );
}