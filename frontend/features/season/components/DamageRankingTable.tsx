import type { RealDamageRankingResult } from "@/features/season/types/index";

type DamageRankingTableProps = {
    realDamageRanking: RealDamageRankingResult[];
};

export function DamageRankingTable({ realDamageRanking }: DamageRankingTableProps) {
    return (
        <div className="w-full flex-shrink-0 bg-white rounded-xl shadow-sm border border-slate-200 p-4">
            <div className="mb-4 pb-2 border-b border-slate-100">
                <h2 className="font-bold text-slate-900 text-base">環境への技の通りが良いランキング</h2>
                <p className="text-xs text-slate-400 mt-0.5">火力指数 ÷ 防御指数（50位の耐久計×相性計）から算出された環境突破力トップ50</p>
            </div>
            
            <div className="overflow-x-auto max-h-[75vh] overflow-y-auto pr-1">
                <table className="w-full text-left border-collapse text-xs min-w-[540px]">
                    <thead>
                        <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold select-none">
                            <th className="px-2 py-2 text-center w-10">順位</th>
                            <th className="px-2 py-2 w-24">ポケモン名</th>
                            <th className="px-2 py-2 w-24">技</th>
                            <th className="px-2 py-2 text-center w-16">タイプ</th>
                            <th className="px-2 py-2 text-center w-14">カテゴリ</th>
                            <th className="px-2 py-2 text-right w-20">火力指数</th>
                            <th className="px-2 py-2 text-right w-24">防御指数</th>
                            <th className="px-3 py-2 text-right text-red-600 font-bold w-24">実質被ダメ</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {realDamageRanking.map((item, index) => (
                            <tr key={`${item.pokemon_name}-${item.move_name}-${index}`} className="hover:bg-red-50/20 transition-colors">
                                <td className="px-2 py-2.5 text-center font-bold">
                                    {item.rank === 1 && <span className="inline-flex items-center justify-center w-5 h-5 rounded bg-red-500 text-white font-mono text-[10px]">1</span>}
                                    {item.rank === 2 && <span className="inline-flex items-center justify-center w-5 h-5 rounded bg-orange-400 text-white font-mono text-[10px]">2</span>}
                                    {item.rank === 3 && <span className="inline-flex items-center justify-center w-5 h-5 rounded bg-amber-400 text-white font-mono text-[10px]">3</span>}
                                    {item.rank > 3 && <span className="text-slate-400 font-mono">{item.rank}</span>}
                                </td>
                                <td className="px-2 py-2.5 font-bold text-slate-800 truncate max-w-[90px]" title={item.pokemon_name}>
                                    {item.pokemon_name}
                                </td>
                                <td className="px-2 py-2.5 font-medium text-slate-700 truncate max-w-[90px]" title={item.move_name}>
                                    {item.move_name}
                                </td>
                                <td className="px-2 py-2.5 text-center">
                                    <span className="inline-block px-1.5 py-0.5 text-[10px] font-semibold rounded bg-slate-100 text-slate-600 border border-slate-200">
                                        {item.move_type}
                                    </span>
                                </td>
                                <td className="px-2 py-2.5 text-center">
                                    <span className={`inline-block px-1.5 py-0.5 text-[10px] font-bold rounded ${item.category === "物理" ? "bg-blue-50 text-blue-600 border border-blue-100" : "bg-purple-50 text-purple-600 border border-purple-100"}`}>
                                        {item.category}
                                    </span>
                                </td>
                                <td className="px-2 py-2.5 text-right font-mono text-slate-500">
                                    {item.power_times_atk.toLocaleString()}
                                </td>
                                <td className="px-2 py-2.5 text-right font-mono text-slate-500">
                                    {item.defense_index.toLocaleString()}
                                </td>
                                <td className="px-3 py-2.5 text-right font-mono font-bold text-red-600 bg-red-50/10 text-sm">
                                    {item.real_damage_percent.toFixed(2)}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}