"use client";

import { useState, useEffect } from "react";
import StatusCalc from "../../status/components/StatusCalc";
import type { BuildCreateRequest } from "@/app/types/api";

// Propsの型定義
interface PokemonBuildFormProps {
    initialData?: BuildCreateRequest; // 既存データ（呼び出し・流用時用）
    onSubmit: (data: BuildCreateRequest, mode: "create" | "update") => void | Promise<void>; // 親に送信を伝える
}

// 完全新規の際のデフォルト状態
const defaultFormData: BuildCreateRequest = {
    pokemon_id: 0,
    pokemon_name: "",
    nickname: "",
    nature: "",
    ability: "",
    item: "",
    tera_type: "",
    moves: ["", "", "", ""],
    evs: { H: 0, A: 0, B: 0, C: 0, D: 0, S: 0 },
    ivs: { H: 31, A: 31, B: 31, C: 31, D: 31, S: 31 },
    memo: ""
};

export default function PokemonBuildForm({ initialData, onSubmit }: PokemonBuildFormProps) {
    const [formData, setFormData] = useState<BuildCreateRequest>(initialData || defaultFormData);

    // 外部から流用データが降ってきたらカチッと入れ替える
    useEffect(() => {
        if (initialData) {
            setFormData(initialData);
        } else {
            setFormData(defaultFormData);
        }
    }, [initialData]);

    const handleClearForm = () => { setFormData(defaultFormData); };
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };
    const handleMoveChange = (index: number, value: string) => {
        setFormData(prev => {
            const newMoves = [...prev.moves];
            newMoves[index] = value;
            return { ...prev, moves: newMoves };
        });
    };

   // ==========================================
    // 💡 修正の核心: 無限ループを防ぐ値の比較ガード
    // ==========================================
    const handleStatusCalcChange = (updatedData: {
        pokemon_id?: number;
        pokemon_name?: string;
        nature?: string;
        evs?: typeof formData.evs;
    }) => {
        setFormData(prev => {
            // 1. StatusCalcがまだ初期化中などの理由でIDが0の場合は、既存の有効なデータを上書きしない
            if (prev.pokemon_id !== 0 && updatedData.pokemon_id === 0) {
                return prev;
            }

            // 2. 浅い比較を行い、全く同じデータが通知されてきた場合は State を更新しない（ループを遮断）
            const isSame =
                prev.pokemon_id === updatedData.pokemon_id &&
                prev.pokemon_name === updatedData.pokemon_name &&
                prev.nature === updatedData.nature &&
                prev.evs.H === updatedData.evs?.H &&
                prev.evs.A === updatedData.evs?.A &&
                prev.evs.B === updatedData.evs?.B &&
                prev.evs.C === updatedData.evs?.C &&
                prev.evs.D === updatedData.evs?.D &&
                prev.evs.S === updatedData.evs?.S;

            if (isSame) {
                return prev; // 既存のStateへの参照をそのまま返すことで再レンダリングをストップ
            }

            // 変更がある場合のみマージ
            return {
                ...prev,
                ...updatedData
            };
        });
    };

    return (
        <div className="space-y-6">
            {/* ステータス設定コンポーネント */}
            <section className="bg-slate-900 border border-slate-800 rounded-2xl p-1 shadow-xl">
                <h2 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-400 border-l-4 border-emerald-500 pl-3">
                    ステータス情報
                </h2>
                {/* 💡 改善の核: key属性により、データ切り替え時にStatusCalcを強制再生成させ、
                      Props変更なしで完璧に新しいポケモン名や初期状態へ追従させます */}
                <StatusCalc 
                    key={`${formData.pokemon_id}-${formData.pokemon_name}-${formData.nature}`}
                    initialPokemonName={formData.pokemon_name}
                    onStatusUpdate={handleStatusCalcChange} 
                />
            </section>

            <div className="space-y-6">
                {/* 基本情報 */}
                <section className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
                    <h2 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-400 border-l-4 border-emerald-500 pl-3">
                        基本情報
                    </h2>

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="flex flex-col gap-1.5">
                            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">ニックネーム</label>
                            <input 
                                type="text" 
                                name="nickname"
                                value={formData.nickname}
                                onChange={handleChange}
                                placeholder="（例）じろう"
                                className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl px-4 py-2 text-sm font-medium text-slate-100 focus:outline-none transition-colors"
                            />
                        </div>
                        <div className="flex flex-col gap-1.5">
                            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">特性</label>
                            <input 
                                type="text" 
                                name="ability"
                                value={formData.ability}
                                onChange={handleChange}
                                placeholder="（例）いかく"
                                className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl px-4 py-2 text-sm font-medium text-slate-100 focus:outline-none transition-colors"
                            />
                        </div>
                        <div className="flex flex-col gap-1.5">
                            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">持ち物</label>
                            <input 
                                type="text" 
                                name="item"
                                value={formData.item}
                                onChange={handleChange}
                                placeholder="（例）こだわりハチマキ"
                                className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl px-4 py-2 text-sm font-medium text-slate-100 focus:outline-none transition-colors"
                            />
                        </div>
                        <div className="flex flex-col gap-1.5">
                            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">テラスタイプ</label>
                            <input 
                                type="text" 
                                name="tera_type"
                                value={formData.tera_type}
                                onChange={handleChange}
                                placeholder="（例）ほのお"
                                className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl px-4 py-2 text-sm font-medium text-slate-100 focus:outline-none transition-colors"
                            />
                        </div>
                    </div>
                </section>

                {/* 技構成 */}
                <section className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
                    <h2 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-400 border-l-4 border-emerald-500 pl-3">
                        技構成
                    </h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                        {formData.moves.map((move, i) => (
                            <div key={i} className="flex flex-col gap-1.5">
                                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">技 {i + 1}</label>
                                <input 
                                    type="text" 
                                    value={move}
                                    onChange={(e) => handleMoveChange(i, e.target.value)}
                                    placeholder={`わざ ${i + 1}`}
                                    className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl px-4 py-2 text-sm font-medium text-slate-100 focus:outline-none transition-colors"
                                />
                            </div>
                        ))}
                    </div>
                </section>

                {/* メモ */}
                <section className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
                    <h2 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-400 border-l-4 border-emerald-500 pl-3">
                        メモ・調整意図
                    </h2>
                    <textarea 
                        name="memo" 
                        value={formData.memo}  
                        onChange={handleChange}
                        placeholder="調整意図や仮想敵へのダメージ計算などを記入してください" 
                        rows={4}
                        className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl px-4 py-3 text-sm font-medium text-slate-100 focus:outline-none transition-colors resize-none"
                    />
                </section>

                {/* アクションボタンエリア */}
                <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4">
                    {/* 連続登録のためにフォームをいつでも真っ新にできるボタン */}
                    <button
                        type="button"
                        onClick={handleClearForm}
                        className="w-full sm:w-auto px-6 py-3 rounded-xl border border-slate-800 text-slate-400 font-bold hover:bg-slate-900 hover:text-slate-300 transition-all text-sm"
                    >
                        フォームをクリア
                    </button>

                    {/* 既存のデータを呼び出して編集している場合（initialDataが存在する場合）のみ、上書きボタンを露出 */}
                    {initialData && (
                        <button
                            type="button"
                            onClick={() => onSubmit(formData, "update")}
                            className="w-full sm:w-auto bg-slate-800 text-slate-200 border border-slate-700 font-bold px-6 py-3 rounded-xl shadow-md hover:bg-slate-700 transition-all text-sm"
                        >
                            既存の構成に上書き保存
                        </button>
                    )}

                    {/* メメインの保存ボタン（流用時は自動で「別名として保存」表記に切り替わります） */}
                    <button
                        type="button"
                        onClick={() => onSubmit(formData, "create")}
                        className="w-full sm:w-auto bg-gradient-to-r from-indigo-500 to-pink-500 text-white font-bold px-8 py-3 rounded-xl shadow-lg hover:from-indigo-600 hover:to-pink-600 transition-all active:scale-[0.98] text-sm"
                    >
                        {initialData ? "別名（新規）として保存" : "構成を保存する"}
                    </button>
                </div>
            </div>
        </div>
    );
}