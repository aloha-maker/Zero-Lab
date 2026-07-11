import type { SeasonPokemonInfo } from "@/features/season/types/index";
import { STAT_COLUMNS, SortKey, SortOrder } from "../types";
import { SortIcon } from "./step1/SortIcon";

type PokemonTableProps = {
    pokemonList: SeasonPokemonInfo[];
    sortedPokemonList: SeasonPokemonInfo[];
    sortKey: SortKey;
    sortOrder: SortOrder;
    onSort: (key: SortKey) => void;
};

export function PokemonTable({ pokemonList, sortedPokemonList, sortKey, sortOrder, onSort }: PokemonTableProps) {
    return (
        <div className="w-full min-w-0 bg-white rounded-xl shadow-sm border border-slate-200">
            <div className="overflow-x-auto w-full rounded-xl">
                <table className="w-full text-left border-collapse min-w-[1000px]">
                    <thead>
                        <tr className="bg-slate-50 border-b border-slate-200 text-sm select-none">
                            <th className="px-4 py-3 font-semibold text-slate-900 w-20 cursor-pointer hover:bg-slate-100 transition-colors" onClick={() => onSort("rank")}>
                                順位 <SortIcon targetKey="rank" currentSortKey={sortKey} sortOrder={sortOrder} />
                            </th>
                            <th className="px-4 py-3 font-semibold text-slate-900 w-28 cursor-pointer hover:bg-slate-100 transition-colors" onClick={() => onSort("id")}>
                                図鑑番号 <SortIcon targetKey="id" currentSortKey={sortKey} sortOrder={sortOrder} />
                            </th>
                            <th className="px-4 py-3 font-semibold text-slate-900 w-48 cursor-pointer hover:bg-slate-100 transition-colors" onClick={() => onSort("name")}>
                                名前 <SortIcon targetKey="name" currentSortKey={sortKey} sortOrder={sortOrder} />
                            </th>
                            <th className="px-4 py-3 font-semibold text-slate-900 w-44">タイプ</th>
                            {STAT_COLUMNS.map((col) => (
                                <th key={col.key} className="px-4 py-3 font-semibold text-slate-900 cursor-pointer hover:bg-slate-100 transition-colors" onClick={() => onSort(col.key)}>
                                    {col.label} <SortIcon targetKey={col.key} currentSortKey={sortKey} sortOrder={sortOrder} />
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-sm">
                        {sortedPokemonList.map((pokemon) => {
                            const currentRank = pokemonList.indexOf(pokemon) + 1;
                            return (
                                <tr key={pokemon.id} className="hover:bg-blue-50/50 transition-colors">
                                    <td className="px-4 py-4 font-bold">
                                        {currentRank === 1 && <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-amber-100 text-amber-700 text-xs">1</span>}
                                        {currentRank === 2 && <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-slate-200 text-slate-700 text-xs">2</span>}
                                        {currentRank === 3 && <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-orange-100 text-orange-700 text-xs">3</span>}
                                        {currentRank > 3 && <span className="text-slate-500 font-mono pl-1.5">{currentRank}</span>}
                                    </td>
                                    <td className="px-4 py-4 font-mono text-slate-500">
                                        #{String(pokemon.id).padStart(3, '0')}
                                    </td>
                                    <td className="px-4 py-4 font-bold text-slate-900">
                                        <div className="flex items-center gap-3">
                                            {pokemon.image_url && (
                                                <img src={pokemon.image_url} alt={pokemon.name} className="w-10 h-10 object-contain bg-slate-50 rounded" loading="lazy" />
                                            )}
                                            <div>
                                                <div>{pokemon.name}</div>
                                                <div className="text-xs text-slate-400 font-normal capitalize">{pokemon.english_name}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-4 py-4">
                                        <div className="flex gap-1.5">
                                            {pokemon.types.map((type) => (
                                                <span key={type} className="inline-block px-2.5 py-1 text-xs font-semibold rounded-md bg-slate-100 text-slate-700 border border-slate-200">
                                                    {type}
                                                </span>
                                            ))}
                                        </div>
                                    </td>
                                    {STAT_COLUMNS.map((col) => {
                                        const score = pokemon.base_stats[col.key] ?? "-";
                                        return (
                                            <td key={col.key} className="px-4 py-4 font-mono font-bold text-slate-800">
                                                {score}
                                            </td>
                                        );
                                    })}
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
}