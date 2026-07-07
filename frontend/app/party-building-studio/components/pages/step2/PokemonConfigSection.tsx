// frontend/app/party-building-studio/components/pages/step2/PokemonConfigSection.tsx
"use client";

import { useState, useEffect } from "react";
import type { PokemonInfo } from "@/app/types/api";
import { NATURES, API_URL } from "@/app/types/constants";
import { ConfiguredMainPokemon,StatType,statLabels,keyMapping } from "./types";


interface PokemonConfigSectionProps {
  selectedPokemon: ConfiguredMainPokemon | null;
  onPokemonConfigComplete: (configuredData: ConfiguredMainPokemon) => void;
}

export default function PokemonConfigSection({ 
  selectedPokemon, 
  onPokemonConfigComplete 
}: PokemonConfigSectionProps) {
  const [searchQuery, setSearchQuery] = useState(selectedPokemon?.name || "");
  const [pokemonData, setPokemonData] = useState<PokemonInfo | null>(selectedPokemon?.pokemonInfo || null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isMovesOpen, setIsMovesOpen] = useState(false);

  const FIXED_LEVEL = 50;
  
  // 性格の初期インデックスを見つけるヘルパー
  const initialNatureIndex = selectedPokemon 
    ? NATURES.findIndex(n => n.name === selectedPokemon.nature.name)
    : 22;

  const [natureIndex, setNatureIndex] = useState(initialNatureIndex >= 0 ? initialNatureIndex : 22);
  
  // selectedPokemonが存在する場合は、親から渡された種族値・努力値を最優先で初期Stateにする
  const [stats, setStats] = useState<Record<StatType, { base: number, iv: number, ev: number }>>({
    H: { base: selectedPokemon?.pokemonInfo?.base_stats?.["hp"] ?? 108, iv: 31, ev: selectedPokemon?.evs?.H ?? 0 },
    A: { base: selectedPokemon?.pokemonInfo?.base_stats?.["attack"] ?? 130, iv: 31, ev: selectedPokemon?.evs?.A ?? 0 },
    B: { base: selectedPokemon?.pokemonInfo?.base_stats?.["defense"] ?? 95, iv: 31, ev: selectedPokemon?.evs?.B ?? 0 },
    C: { base: selectedPokemon?.pokemonInfo?.base_stats?.["special-attack"] ?? 80, iv: 31, ev: selectedPokemon?.evs?.C ?? 0 },
    D: { base: selectedPokemon?.pokemonInfo?.base_stats?.["special-defense"] ?? 85, iv: 31, ev: selectedPokemon?.evs?.D ?? 0 },
    S: { base: selectedPokemon?.pokemonInfo?.base_stats?.["speed"] ?? 102, iv: 31, ev: selectedPokemon?.evs?.S ?? 0 },
  });

  const [calcResults, setCalcResults] = useState<Record<StatType, number | null>>({
    H: selectedPokemon?.realStats?.H ?? null,
    A: selectedPokemon?.realStats?.A ?? null,
    B: selectedPokemon?.realStats?.B ?? null,
    C: selectedPokemon?.realStats?.C ?? null,
    D: selectedPokemon?.realStats?.D ?? null,
    S: selectedPokemon?.realStats?.S ?? null,
  });

  const [isCalcLoading, setIsCalcLoading] = useState(false);
  const [calcError, setCalcError] = useState<string | null>(null);

  // 初期選択タグの状態管理
  const [tagStates, setTagStates] = useState([
    { label: "崩し性能", checked: selectedPokemon?.tags.includes("崩し性能") ?? true },
    { label: "行動保障", checked: selectedPokemon?.tags.includes("行動保障") ?? false },
    { label: "対面操作", checked: selectedPokemon?.tags.includes("対面操作") ?? false },
    { label: "縛り性能", checked: selectedPokemon?.tags.includes("縛り性能") ?? true },
    { label: "耐久・回復", checked: selectedPokemon?.tags.includes("耐久・回復") ?? false },
  ]);

  useEffect(() => {
    if (pokemonData) {
      onPokemonConfigComplete({
        name: pokemonData.name,
        pokemonInfo: pokemonData,
        nature: NATURES[natureIndex],
        evs: { H: stats.H.ev, A: stats.A.ev, B: stats.B.ev, C: stats.C.ev, D: stats.D.ev, S: stats.S.ev },
        realStats: calcResults,
        tags: tagStates.filter(t => t.checked).map(t => t.label),
      });
    }
  }, [natureIndex, stats, tagStates, calcResults, pokemonData]);

  // 再表示（コンポーネントがマウントされた瞬間）に、すでに親に保持されている有効なデータがある場合のみ同期をかける
  useEffect(() => {
    if (selectedPokemon && selectedPokemon.pokemonInfo) {
      setSearchQuery(selectedPokemon.name);
      setPokemonData(selectedPokemon.pokemonInfo);
      setCalcResults(selectedPokemon.realStats);
      
      const nIndex = NATURES.findIndex(n => n.name === selectedPokemon.nature.name);
      if (nIndex >= 0) setNatureIndex(nIndex);
      
      setTagStates(prev => prev.map(t => ({ ...t, checked: selectedPokemon.tags.includes(t.label) })));

      setStats({
        H: { base: selectedPokemon.pokemonInfo.base_stats["hp"] ?? 0, iv: 31, ev: selectedPokemon.evs.H ?? 0 },
        A: { base: selectedPokemon.pokemonInfo.base_stats["attack"] ?? 0, iv: 31, ev: selectedPokemon.evs.A ?? 0 },
        B: { base: selectedPokemon.pokemonInfo.base_stats["defense"] ?? 0, iv: 31, ev: selectedPokemon.evs.B ?? 0 },
        C: { base: selectedPokemon.pokemonInfo.base_stats["special-attack"] ?? 0, iv: 31, ev: selectedPokemon.evs.C ?? 0 },
        D: { base: selectedPokemon.pokemonInfo.base_stats["special-defense"] ?? 0, iv: 31, ev: selectedPokemon.evs.D ?? 0 },
        S: { base: selectedPokemon.pokemonInfo.base_stats["speed"] ?? 0, iv: 31, ev: selectedPokemon.evs.S ?? 0 },
      });
    }
  }, []);

  const handleFetchPokemon = async () => {
    if (!searchQuery.trim()) return;
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_URL}/api/v1/pokemon/${searchQuery.toLowerCase().trim()}`);
      if (!response.ok) throw new Error("ポケモンのデータが見つかりませんでした");
      const data: PokemonInfo = await response.json();
      setPokemonData(data);
      setIsMovesOpen(false);

      if (data && data.base_stats) {
        // 1. ローカルの種族値・努力値Stateを更新
        let updatedStats = { ...stats };
        Object.entries(data.base_stats).forEach(([jpKey, val]) => {
          const engKey = keyMapping[jpKey];
          if (engKey) {
            updatedStats[engKey] = { base: val, iv: 31, ev: 0 };
          }
        });
        setStats(updatedStats);
        
        const clearedCalcResults = { H: null, A: null, B: null, C: null, D: null, S: null };
        setCalcResults(clearedCalcResults);
        setCalcError(null);

        // 💡 2. 追加: データ取得に成功した時点で、一度親（Layout）にデータを同期する
        onPokemonConfigComplete({
          name: data.name,
          pokemonInfo: data,
          nature: NATURES[natureIndex],
          evs: { 
            H: updatedStats.H.ev, 
            A: updatedStats.A.ev, 
            B: updatedStats.B.ev, 
            C: updatedStats.C.ev, 
            D: updatedStats.D.ev, 
            S: updatedStats.S.ev 
          },
          realStats: clearedCalcResults,
          tags: tagStates.filter(t => t.checked).map(t => t.label),
        });
      }
    } catch (err: any) {
      setError(err.message || "データの取得に失敗しました");
      setPokemonData(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatChange = (stat: StatType, field: 'base' | 'ev', value: number) => {
    setStats(prev => ({
      ...prev,
      [stat]: { ...prev[stat], [field]: value }
    }));
  };

  const handleTagChange = (index: number) => {
    setTagStates(prev => prev.map((t, i) => i === index ? { ...t, checked: !t.checked } : t));
  };

  const handleCalculate = async () => {
    if (!pokemonData) return;
    setIsCalcLoading(true);
    setCalcError(null);

    const selectedNature = NATURES[natureIndex];

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
      const newResults = { H: 1, A: 0, B: 0, C: 0, D: 0, S: 0 };
      resArray.forEach(r => { newResults[r.key] = r.val; });
      setCalcResults(newResults);

      // 計算が完了した実数値を親コンポーネントに通知して確定させる
      onPokemonConfigComplete({
        name: pokemonData.name,
        pokemonInfo: pokemonData,
        nature: selectedNature,
        evs: { H: stats.H.ev, A: stats.A.ev, B: stats.B.ev, C: stats.C.ev, D: stats.D.ev, S: stats.S.ev },
        realStats: newResults,
        tags: tagStates.filter(t => t.checked).map(t => t.label),
      });

    } catch (error: any) {
      console.error("Error:", error);
      setCalcError(error.message || "サーバーとの通信に失敗しました。");
    } finally {
      setIsCalcLoading(false);
    }
  };

  return (
    <>
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
            className="flex-1 px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800"
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
          {tagStates.map((tag, index) => (
            <label
              key={tag.label}
              className="flex items-center gap-2 bg-slate-50 p-3 rounded-lg border border-slate-200 cursor-pointer hover:bg-slate-100"
            >
              <input 
                type="checkbox" 
                checked={tag.checked} 
                onChange={() => handleTagChange(index)}
                className="w-4 h-4" 
              />
              <span className="text-sm font-medium text-slate-700">{tag.label}</span>
            </label>
          ))}
        </div>
      </div>

      {pokemonData && (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* 左側: ポケモン画像 ＆ 基本情報 */}
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

            {/* 右側: ステータス入力・計算テーブル */}
            <div className="lg:col-span-9 w-full space-y-4">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 pb-2 border-b border-slate-100">
                <h4 className="font-bold text-slate-700 text-base">ステータス実数値計算 (Lv.50)</h4>
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

              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm min-w-[450px]">
                  <thead className="bg-slate-50 text-slate-600 border-b border-slate-200">
                    <tr>
                      <th className="p-2 font-bold">ステータス</th>
                      <th className="p-2 font-bold text-center w-24">種族値</th>
                      <th className="p-2 font-bold text-center w-28">努力値 (0~32)</th>
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
                          <td className="p-1">
                            <input
                              type="number"
                              value={stats[key].base}
                              min={1} max={255}
                              onChange={(e) => handleStatChange(key, 'base', Number(e.target.value))}
                              className="w-full border border-slate-300 rounded p-1 text-center font-medium focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none text-slate-700 bg-white"
                            />
                          </td>
                          <td className="p-1">
                            <input
                              type="number"
                              value={stats[key].ev}
                              min={0} max={32} step={1}
                              onChange={(e) => handleStatChange(key, 'ev', Number(e.target.value))}
                              className="w-full border border-slate-300 rounded p-1 text-center font-medium focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none text-slate-700 bg-white"
                            />
                          </td>
                          <td className="p-2 text-center font-bold text-xs">
                            {key === 'H' ? <span className="text-slate-300">-</span> :
                              isUp ? <span className="text-red-500 bg-red-50 px-1.5 py-0.5 rounded">1.1</span> :
                                isDown ? <span className="text-blue-500 bg-blue-50 px-1.5 py-0.5 rounded">0.9</span> :
                                  <span className="text-slate-400">1.0</span>}
                          </td>
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

              {calcError && (
                <div className="p-2 bg-red-50 border border-red-100 text-red-600 text-xs rounded-md">
                  {calcError}
                </div>
              )}

              <button
                onClick={handleCalculate}
                disabled={isCalcLoading}
                className="w-full bg-slate-800 text-white px-4 py-2 rounded-lg font-bold text-sm hover:bg-slate-700 transition disabled:opacity-50"
              >
                {isCalcLoading ? "計算中..." : "実数値を確定して反映する"}
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

            {isMovesOpen && (
              <div className="mt-3 overflow-hidden rounded-lg border border-slate-200 bg-white">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm text-slate-600">
                    <thead className="bg-slate-50 text-xs uppercase text-slate-500 border-b border-slate-200">
                      <tr>
                        <th className="px-4 py-3">技名</th>
                        <th className="px-4 py-3">タイプ</th>
                        <th className="px-4 py-3 text-center">カテゴリ</th>
                        <th className="px-4 py-3 text-right">威力</th>
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
                            <td className="px-4 py-3 font-medium text-slate-800">{move.name}</td>
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
    </>
  );
}