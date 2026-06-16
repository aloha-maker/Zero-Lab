import { useState } from "react";
import type { PokemonInfo, ApiErrorResponse } from "@/app/types/api";


export default function Step1Screen() {
  // 入力値、取得データ、ローディング、エラーの状態管理
  const [searchQuery, setSearchQuery] = useState("ガブリアス");
  const [pokemonData, setPokemonData] = useState<PokemonInfo | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 技一覧の折りたたみ状態
  const [isMovesOpen, setIsMovesOpen] = useState(false);

  // API呼び出し関数
  const handleFetchPokemon = async () => {
    if (!searchQuery.trim()) return;

    setIsLoading(true);
    setError(null);
    
    try {
      // 本番環境のURLに合わせて適宜書き換えてください
      const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"; 
      const response = await fetch(`${API_URL}/api/v1/pokemon/${searchQuery.toLowerCase().trim()}`);
      
      if (!response.ok) {
        throw new Error("ポケモンのデータが見つかりませんでした");
      }

      const data: PokemonInfo = await response.json();
      setPokemonData(data);
      setIsMovesOpen(false); // 新しいポケモンを読み込んだ時は技一覧を一度閉じる
    } catch (err: any) {
      setError(err.message || "データの取得に失敗しました");
      setPokemonData(null);
    } finally {
      setIsLoading(false);
    }
  };

  const tags = [
    { label: "崩し性能", checked: true },
    { label: "行動保障", checked: false },
    { label: "対面操作", checked: false },
    { label: "縛り性能", checked: true },
    { label: "耐久・回復", checked: false },
  ];

  return (
    <section className="space-y-6 animate-in fade-in duration-300">
      {/* 主軸設定 */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
        <h3 className="font-bold text-lg mb-4 text-slate-700">
          主軸ポケモンの設定とタグ付け
        </h3>

        <div className="flex gap-4 mb-6">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="ポケモン名を入力"
            className="flex-1 px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            onKeyDown={(e) => {
              if (e.key === "Enter") handleFetchPokemon(); // エンターキーでも検索可能に
            }}
          />

          <button 
            onClick={handleFetchPokemon}
            disabled={isLoading}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-6 py-2 rounded-lg font-medium transition flex items-center justify-center min-w-[120px]"
          >
            {isLoading ? "取得中..." : "データ取得"}
          </button>
        </div>

        {/* エラーメッセージの表示 */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100">
            {error}
          </div>
        )}

        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {tags.map((tag) => (
            <label
              key={tag.label}
              className="flex items-center gap-2 bg-slate-50 p-3 rounded-lg border border-slate-200 cursor-pointer hover:bg-slate-100"
            >
              <input
                type="checkbox"
                defaultChecked={tag.checked}
                className="w-4 h-4"
              />
              <span className="text-sm font-medium">
                {tag.label}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* API取得データ表示エリア */}
      {pokemonData && (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="flex flex-col md:flex-row gap-6 items-start">
            
            {/* ポケモン画像 ＆ 基本情報 */}
            <div className="flex flex-col items-center bg-slate-50 p-4 rounded-xl border border-slate-100 min-w-[200px] w-full md:w-auto">
              {pokemonData.image_url ? (
                <img src={pokemonData.image_url} alt={pokemonData.name} className="w-32 h-32 object-contain mb-2" />
              ) : (
                <div className="w-32 h-32 bg-slate-200 rounded flex items-center justify-center text-slate-400 text-xs mb-2">No Image</div>
              )}
              <h4 className="font-bold text-xl text-slate-800 mb-1">{pokemonData.name}</h4>
              <div className="flex gap-1.5 mb-2">
                {pokemonData.types.map((type) => (
                  <span key={type} className="bg-slate-200 text-slate-700 text-xs px-2.5 py-0.5 rounded-full font-medium">
                    {type}
                  </span>
                ))}
              </div>
              <div className="text-xs text-slate-500 text-center">
                特性: {pokemonData.abilities.join(" / ")}
              </div>
            </div>

            {/* 種族値 */}
            <div className="flex-1 w-full">
              <h4 className="font-bold text-slate-700 mb-3 text-sm">種族値</h4>
              <div className="space-y-2">
                {Object.entries(pokemonData.base_stats).map(([statName, value]) => {
                  const maxStatValue = 160;
                  const percentage = Math.min((value / maxStatValue) * 100, 100);
                  
                  return (
                    <div key={statName} className="flex items-center text-sm">
                      <span className="w-16 text-slate-500 font-medium">{statName}</span>
                      <span className="w-10 text-right font-bold text-slate-700 mr-3">{value}</span>
                      <div className="flex-1 bg-slate-100 h-2.5 rounded-full overflow-hidden">
                        <div 
                          className="bg-blue-500 h-full rounded-full" 
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* 技一覧（折りたたみ表形式） */}
          <div className="mt-6 border-t border-slate-100 pt-4">
            <button 
              onClick={() => setIsMovesOpen(!isMovesOpen)}
              className="w-full flex justify-between items-center bg-slate-50 hover:bg-slate-100 px-4 py-3 rounded-lg border border-slate-200 font-medium text-sm text-slate-700 transition"
            >
              <span>覚える技一覧 ({pokemonData.moves.length}件)</span>
              <span className={`transform transition-transform duration-200 text-slate-400 ${isMovesOpen ? "rotate-180" : ""}`}>
                ▼
              </span>
            </button>

            {isMovesOpen && (
              <div className="mt-3 overflow-x-auto border border-slate-200 rounded-lg animate-in fade-in slide-in-from-top-2 duration-200">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-50 text-slate-600 border-b border-slate-200">
                    <tr>
                      <th className="p-3 font-semibold">技名</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 bg-white">
                    {pokemonData.moves.map((move, index) => (
                      <tr key={index} className="hover:bg-slate-50">
                        <td className="p-3 text-slate-700 font-medium">{move}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 相性表 */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-bold text-lg text-slate-700">
            環境トップとの有利不利マトリクス
          </h3>

          <button className="text-blue-600 text-sm font-medium hover:underline">
            ダメージ計算を自動実行
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-100 text-slate-600">
              <tr>
                <th className="p-3 rounded-tl-lg">環境ポケモン</th>
                <th className="p-3 text-center">対面判定</th>
                <th className="p-3 rounded-tr-lg">不利理由カテゴリー</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              <tr>
                <td className="p-3 font-medium">1. カイリュー</td>
                <td className="p-3 text-center">
                  <span className="bg-yellow-100 text-yellow-700 font-bold px-3 py-1 rounded">△</span>
                </td>
                <td className="p-3 text-slate-600">行動保障（マルチスケイル）</td>
              </tr>
              <tr>
                <td className="p-3 font-medium">2. ハバタクカミ</td>
                <td className="p-3 text-center">
                  <span className="bg-red-100 text-red-700 font-bold px-3 py-1 rounded">×</span>
                </td>
                <td className="p-3 text-slate-600">速度負け</td>
              </tr>
              <tr>
                <td className="p-3 font-medium">3. サーフゴー</td>
                <td className="p-3 text-center">
                  <span className="bg-blue-100 text-blue-700 font-bold px-3 py-1 rounded">◎</span>
                </td>
                <td className="p-3 text-slate-400">-</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}