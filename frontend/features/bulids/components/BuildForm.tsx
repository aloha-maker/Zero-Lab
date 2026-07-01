"use client";

import Link from "next/link";
import StatForm from "@/features/stat-calculator/components/StatForm";
import { useBuildForm } from "../hooks/useBuildForm";

interface BuildFormProps {
    id?: string; // 編集時は必須、新規時は渡さない
}

const inputStyle = "w-full bg-slate-50 border border-slate-300 p-2.5 rounded-lg text-slate-900 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all";
const labelStyle = "block text-sm font-bold mb-1.5 text-slate-700";
const sectionStyle = "bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-slate-200 mb-8";
const sectionHeaderStyle = "text-xl font-bold mb-6 text-slate-800 border-l-4 border-indigo-500 pl-3";

export function BuildForm({ id }: BuildFormProps) {
    const {
        isEditMode,
        formData,
        loading,
        saving,
        errorMsg,
        initialPokemonName,
        handleChange,
        handleMoveChange,
        handleStatusUpdate,
        handleSubmit
    } = useBuildForm({ id });

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin h-10 w-10 border-4 border-indigo-500 border-t-transparent rounded-full"></div>
                <span className="ml-3 text-slate-600 font-medium">データを読み込み中...</span>
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit}>
            {errorMsg && (
                <div className="mb-8 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded-r-lg shadow-sm">
                    <p className="font-medium">{errorMsg}</p>
                </div>
            )}

            {/* 1. ポケモン選択・ステータス計算 */}
            <div className="mb-8">
                <StatForm 
                    initialPokemonName={isEditMode ? initialPokemonName : undefined}
                    onStatusUpdate={handleStatusUpdate} 
                />
            </div>

            {/* 2. 基本情報 */}
            <section className={sectionStyle}>
                <h2 className={sectionHeaderStyle}>基本情報</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className={labelStyle}>ニックネーム</label>
                        <input 
                            type="text" 
                            name="nickname" 
                            value={formData.nickname} 
                            onChange={handleChange} 
                            className={inputStyle} 
                            placeholder="例: エースアタッカー"
                        />
                    </div>
                    <div>
                        <label className={labelStyle}>テラスタイプ</label>
                        <input 
                            type="text" 
                            name="tera_type" 
                            value={formData.tera_type} 
                            onChange={handleChange} 
                            className={inputStyle} 
                            placeholder="例: ノーマル"
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className={labelStyle}>特性</label>
                            <input 
                                type="text" 
                                name="ability" 
                                value={formData.ability} 
                                onChange={handleChange} 
                                className={inputStyle} 
                            />
                        </div>
                        <div>
                            <label className={labelStyle}>持ち物</label>
                            <input 
                                type="text" 
                                name="item" 
                                value={formData.item} 
                                onChange={handleChange} 
                                className={inputStyle} 
                            />
                        </div>
                    </div>
                </div>
            </section>

            {/* 3. 技構成 */}
            <section className={sectionStyle}>
                <h2 className={sectionHeaderStyle}>技構成</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                    {formData.moves.map((move, i) => (
                        <div key={i}>
                            <label className={labelStyle}>技 {i + 1}</label>
                            <input 
                                type="text" 
                                value={move} 
                                onChange={(e) => handleMoveChange(i, e.target.value)} 
                                className={inputStyle} 
                            />
                        </div>
                    ))}
                </div>
            </section>

            {/* 4. メモ */}
            <section className={sectionStyle}>
                <h2 className={sectionHeaderStyle}>メモ・調整意図</h2>
                <textarea 
                    name="memo" 
                    value={formData.memo} 
                    onChange={handleChange} 
                    className={`${inputStyle} h-32 resize-y`} 
                    placeholder="調整意図などを記入してください" 
                />
            </section>

            {/* アクションボタン */}
            <div className="flex justify-between items-center pt-4 pb-12 border-t border-slate-200 mt-8">
                <Link 
                    href="/builds" 
                    className="px-6 py-3 bg-slate-200 text-slate-700 font-bold rounded-xl hover:bg-slate-300 transition-colors shadow-sm"
                >
                    キャンセル
                </Link>
                <button 
                    type="submit" 
                    disabled={saving} 
                    className="px-8 py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 disabled:opacity-50 transition-colors shadow-md flex items-center justify-center min-w-[200px]"
                >
                    {saving ? (
                        <>
                            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            {isEditMode ? "保存中..." : "登録中..."}
                        </>
                    ) : (
                        isEditMode ? "変更を保存する" : "新しく登録する"
                    )}
                </button>
            </div>
        </form>
    );
}