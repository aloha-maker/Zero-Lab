import { useState, useEffect } from "react";
import type { PokemonInfo, ApiErrorResponse } from "@/app/types/api";
import { NATURES } from "@/app/types/constants";

// ─── 計算機用の型定義と定数 ───
type StatType = 'H' | 'A' | 'B' | 'C' | 'D' | 'S';
const statLabels: Record<StatType, string> = { H: "HP", A: "攻撃", B: "防御", C: "特攻", D: "特防", S: "素早さ" };

// base_stats の日本語キーと StatType のマッピング
const keyMapping: Record<string, StatType> = {
  "HP": "H", "攻撃": "A", "防御": "B", "特攻": "C", "特防": "D", "素早さ": "S"
};

export default function Step1Screen() {
  // 検索・取得用のState
  const [searchQuery, setSearchQuery] = useState("ガブリアス");
  const [pokemonData, setPokemonData] = useState<PokemonInfo | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 技一覧の折りたたみ状態
  const [isMovesOpen, setIsMovesOpen] = useState(false);

  // ─── 追加：ステータス計算用のState ───
  const FIXED_LEVEL = 50;
  const [natureIndex, setNatureIndex] = useState(22); // 初期値: ようき (NATURES配列に合わせて調整)
  const [stats, setStats] = useState<Record<StatType, { base: number, iv: number, ev: number }>>({
    H: { base: 108, iv: 31, ev: 0 },
    A: { base: 130, iv: 31, ev: 0 },
    B: { base: 95, iv: 31, ev: 0 },
    C: { base: 80, iv: 31, ev: 0 },
    D: { base: 85, iv: 31, ev: 0 },
    S: { base: 102, iv: 31, ev: 0 },
  });
  const [calcResults, setCalcResults] = useState<Record<StatType, number | null>>({
    H: null, A: null, B: null, C: null, D: null, S: null
  });
  const [isCalcLoading, setIsCalcLoading] = useState(false);
  const [calcError, setCalcError] = useState<string | null>(null);

  // ポケモンデータが新しく取得されたら、計算機の種族値(base)を自動更新する
  useEffect(() => {
    if (pokemonData && pokemonData.base_stats) {
      setStats(prev => {
        const updated = { ...prev };
        Object.entries(pokemonData.base_stats).forEach(([jpKey, val]) => {
          const engKey = keyMapping[jpKey];
          if (engKey) {
            updated[engKey] = { ...updated[engKey], base: val };
          }
        });
        return updated;
      });
      // 新しいポケモンになったら前回の結果をクリア
      setCalcResults({ H: null, A: null, B: null, C: null, D: null, S: null });
      setCalcError(null);
    }
  }, [pokemonData]);

  // ポケモンデータ取得
  const handleFetchPokemon = async () => {
    if (!searchQuery.trim()) return;
    setIsLoading(true);
    setError(null);
    try {
      // 本番環境のURLに合わせて適宜書き換えてください
      const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"; 
      const response = await fetch(`${API_URL}/api/v1/pokemon/${searchQuery.toLowerCase().trim()}`);
      if (!response.ok) throw new Error("ポケモンのデータが見つかりませんでした");
      const data: PokemonInfo = await response.json();
      setPokemonData(data);
      setIsMovesOpen(false);
    } catch (err: any) {
      setError(err.message || "データの取得に失敗しました");
      setPokemonData(null);
    } finally {
      setIsLoading(false);
    }
  };

  // ─── 追加：計算機の入力変更ハンドラ ───
  const handleStatChange = (stat: StatType, field: 'base' | 'ev', value: number) => {
    setStats(prev => ({
      ...prev,
      [stat]: { ...prev[stat], [field]: value }
    }));
  };

  // ─── 追加：一括実数値計算処理 ───
  const handleCalculate = async () => {
    setIsCalcLoading(true);
    setCalcError(null);
    setCalcResults({ H: null, A: null, B: null, C: null, D: null, S: null });

    const selectedNature = NATURES[natureIndex];
    const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"; // ステータス計算APIのURL

    try {
      const promises = (Object.keys(stats) as StatType[]).map(async (key) => {
        let modifier = 1.0;
        if (key !== 'H') {
          if (selectedNature.up === key) modifier = 1.1;
          if (selectedNature.down === key) modifier = 0.9;
        }

        const requestData = {
          base_stat: stats[key].base,
          iv: 31,
          ev: stats[key].ev,
          level: FIXED_LEVEL,
          is_hp: key === 'H',
          nature_modifier: modifier
        };

        const response = await fetch(`${API_URL}/api/v1/status`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(requestData),
        });

        if (!response.ok) {
          const errorData = await response.json();
          let errorMessage = "通信エラー";
          if (typeof errorData.detail === 'string') {
            errorMessage = errorData.detail;
          } else if (Array.isArray(errorData.detail)) {
            errorMessage = errorData.detail.map((e: any) => e.msg).join(", ");
          }
          throw new Error(`${statLabels[key]}: ${errorMessage}`);
        }

        const data = await response.json();
        return { key, val: data.real_stat };
      });

      const resArray = await Promise.all(promises);
      const newResults = { ...calcResults };
      resArray.forEach(r => { newResults[r.key] = r.val; });
      setCalcResults(newResults);
    } catch (error: any) {
      console.error("Error:", error);
      setCalcError(error.message || "サーバーとの通信に失敗しました。");
    } finally {
      setIsCalcLoading(false);
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
            onKeyDown={(e) => { if (e.key === "Enter") handleFetchPokemon(); }}
          />

          <button
            onClick={handleFetchPokemon}
            disabled={isLoading}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-6 py-2 rounded-lg font-medium transition min-w-[120px]"
          >
            {isLoading ? "取得中..." : "データ取得"}
          </button>
        </div>

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
              <input type="checkbox" defaultChecked={tag.checked} className="w-4 h-4" />
              <span className="text-sm font-medium">{tag.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* ─── 変更：API取得データ ＆ 実数値計算表示エリア ─── */}
      {pokemonData && (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 animate-in fade-in slide-in-from-top-4 duration-300">

          {/* グリッドレイアウトで左右に分割（左: ポケモン基本情報 / 右: 計算機） */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

            {/* 左側: ポケモン画像 ＆ 基本情報 (3/12カラム) */}
            <div className="lg:col-span-3 flex flex-col items-center bg-slate-50 p-4 rounded-xl border border-slate-100 w-full">
              {pokemonData.image_url ? (
                <img src={pokemonData.image_url} alt={pokemonData.name} className="w-32 h-32 object-contain mb-2" />
              ) : (
                <div className="w-32 h-32 bg-slate-200 rounded flex items-center justify-center text-slate-400 text-xs mb-2">No Image</div>
              )}
              <h4 className="font-bold text-xl text-slate-800 mb-1">{pokemonData.name}</h4>
              <div className="flex gap-1.5 mb-2 flex-wrap justify-center">
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

            {/* 右側: ステータス入力・計算テーブル (9/12カラム) */}
            <div className="lg:col-span-9 w-full space-y-4">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 pb-2 border-b border-slate-100">
                <h4 className="font-bold text-slate-700 text-base">ステータス実数値計算 (Lv.50)</h4>

                {/* 性格選択 */}
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <label className="text-xs font-bold text-slate-500 whitespace-nowrap">性格:</label>
                  <select
                    value={natureIndex}
                    onChange={(e) => setNatureIndex(Number(e.target.value))}
                    className="text-xs border border-slate-300 rounded-lg p-1.5 bg-white focus:ring-2 focus:ring-blue-500 outline-none text-slate-700 font-medium"
                  >
                    {NATURES.map((n, i) => (
                      <option key={i} value={i}>{n.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* テーブルエリア */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm min-w-[450px]">
                  <thead className="bg-slate-50 text-slate-600 border-b border-slate-200">
                    <tr>
                      <th className="p-2 font-bold">ステータス</th>
                      <th className="p-2 font-bold text-center w-24">種族値</th>
                      <th className="p-2 font-bold text-center w-28">努力値 (0~252)</th>
                      <th className="p-2 font-bold text-center w-20">補正</th>
                      <th className="p-2 font-bold text-center w-28">実数値</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {(Object.keys(stats) as StatType[]).map(key => {
                      const selectedNature = NATURES[natureIndex];
                      const isUp = key !== 'H' && selectedNature.up === key;
                      const isDown = key !== 'H' && selectedNature.down === key;

                      return (
                        <tr key={key} className="hover:bg-slate-50/50 transition-colors">
                          <td className="p-2 font-bold text-slate-700">{statLabels[key]}</td>

                          {/* 種族値入力（自動補完＆手動変更可） */}
                          <td className="p-1">
                            <input
                              type="number"
                              value={stats[key].base}
                              min={1} max={255}
                              onChange={(e) => handleStatChange(key, 'base', Number(e.target.value))}
                              className="w-full border border-slate-300 rounded p-1 text-center font-medium focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none text-slate-700 bg-white"
                            />
                          </td>

                          {/* 努力値入力 */}
                          <td className="p-1">
                            <input
                              type="number"
                              value={stats[key].ev}
                              min={0} max={252} step={4}
                              onChange={(e) => handleStatChange(key, 'ev', Number(e.target.value))}
                              className="w-full border border-slate-300 rounded p-1 text-center font-medium focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none text-slate-700 bg-white"
                            />
                          </td>

                          {/* 性格補正倍率 */}
                          <td className="p-2 text-center font-bold text-xs">
                            {key === 'H' ? <span className="text-slate-300">-</span> :
                              isUp ? <span className="text-red-500 bg-red-50 px-1.5 py-0.5 rounded">1.1</span> :
                                isDown ? <span className="text-blue-500 bg-blue-50 px-1.5 py-0.5 rounded">0.9</span> :
                                  <span className="text-slate-400">1.0</span>}
                          </td>

                          {/* 計算結果実数値 */}
                          <td className="p-1 text-center">
                            <div className="bg-blue-50 text-blue-700 font-extrabold text-base py-1 rounded-md min-h-[32px] flex items-center justify-center border border-blue-100">
                              {calcResults[key] !== null ? calcResults[key] : <span className="text-blue-200">-</span>}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* 計算エラーメッセージ */}
              {calcError && (
                <div className="p-2 bg-red-50 border border-red-100 text-red-600 text-xs rounded-md">
                  {calcError}
                </div>
              )}

              {/* 計算ボタン */}
              <button
                onClick={handleCalculate}
                disabled={isCalcLoading}
                className="w-full bg-slate-800 text-white px-4 py-2 rounded-lg font-bold text-sm hover:bg-slate-700 transition disabled:opacity-50"
              >
                {isCalcLoading ? "計算中..." : "実数値を計算する"}
              </button>
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

            {/* 💡 折りたたみの中身を修正 */}
              {isMovesOpen && (
                <div className="mt-3 overflow-hidden rounded-lg border border-slate-200 bg-white">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-slate-600">
                      <thead className="bg-slate-50 text-xs uppercase text-slate-500 border-b border-slate-200">
                        <tr>
                          <th className="px-4 py-3">技名</th>
                          <th className="px-4 py-3">タイプ</th>
                          <th className="px-4 py-3 text-center">カテゴリ</th>
                          <th className="px-4 py-3 text-right">威力</th> {/* 💡 追加 */}
                          <th className="px-4 py-3 text-right">命中</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {pokemonData.moves.map((move, index) => {
                          const damageClassColors = {
                            "ぶつり": "bg-orange-50 text-orange-700 border-orange-200",
                            "とくしゅ": "bg-blue-50 text-blue-700 border-blue-200",
                            "へんか": "bg-slate-100 text-slate-600 border-slate-300",
                          }[move.damage_class] || "bg-slate-50 text-slate-500 border-slate-200";

                          return (
                            <tr key={index} className="hover:bg-slate-50/70 transition-colors">
                              <td className="px-4 py-3 font-medium text-slate-800">
                                {move.name}
                              </td>
                              
                              <td className="px-4 py-3">
                                <span className="inline-block text-xs font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                                  {move.type}
                                </span>
                              </td>
                              
                              <td className="px-4 py-3 text-center">
                                <span className={`inline-block text-xs px-2 py-0.5 rounded-full border ${damageClassColors}`}>
                                  {move.damage_class}
                                </span>
                              </td>

                              {/* 💡 追加: 威力 (設定がない場合は "—") */}
                              <td className="px-4 py-3 text-right font-mono text-slate-600 font-medium">
                                {move.power !== null && move.power !== undefined ? move.power : "—"}
                              </td>
                              
                              <td className="px-4 py-3 text-right font-mono text-slate-500">
                                {move.accuracy !== null && move.accuracy !== undefined ? `${move.accuracy}%` : "—"}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
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