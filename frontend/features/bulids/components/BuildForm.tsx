"use client";

import React from "react";
import Link from "next/link";
import StatForm from "@/features/stat-calculator/components/StatForm";
import { useBuildForm } from "../hooks/useBuildForm";

interface BuildFormProps {
    id?: string; // 編集時は必須、新規時は渡さない
}

const inputStyle =
    "w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 rounded-lg p-2.5 text-sm text-slate-100 placeholder-slate-600 outline-none transition-all";
const labelStyle = "block text-xs font-bold mb-1.5 text-slate-400 uppercase tracking-wide";
const sectionWrap = "px-6 md:px-8 py-7 border-t border-slate-800/80";

function SectionEyebrow({ children }: { children: React.ReactNode }) {
    return (
        <div className="flex items-center gap-2 mb-5">
            <span className="w-4 h-[2px] rounded-full bg-gradient-to-r from-indigo-400 to-pink-400" />
            <h2 className="text-xs font-bold uppercase tracking-[0.15em] text-indigo-400">
                {children}
            </h2>
        </div>
    );
}

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
            <div className="max-w-3xl mx-auto bg-slate-950 border border-slate-800/80 rounded-3xl shadow-2xl flex flex-col items-center justify-center h-72 gap-3">
                <div className="animate-spin h-8 w-8 border-2 border-indigo-500 border-t-transparent rounded-full" />
                <span className="text-slate-400 text-sm font-medium">データを読み込み中...</span>
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit} className="max-w-3xl mx-auto">
            <div className="bg-slate-950 border border-slate-800/80 rounded-3xl shadow-2xl overflow-hidden">
                {/* 上部アクセントライン */}
                <div className="h-[3px] bg-gradient-to-r from-indigo-500 via-pink-500 to-indigo-500 bg-[length:200%_100%]" />

                {/* カードヘッダー */}
                <div className="px-6 md:px-8 pt-6 pb-5 flex items-start justify-between gap-4">
                    <div>
                        <span className="inline-block text-[10px] font-bold tracking-widest uppercase text-slate-500 bg-slate-900 border border-slate-800 rounded-full px-2.5 py-1 mb-2">
                            {isEditMode ? "編集中" : "新規作成"}
                        </span>
                        <h1 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-pink-400 leading-tight">
                            {formData.nickname || "新しいビルド"}
                        </h1>
                    </div>
                    {formData.tera_type && (
                        <span className="shrink-0 mt-1 text-xs font-bold text-pink-300 bg-pink-500/10 border border-pink-500/30 rounded-full px-3 py-1.5 whitespace-nowrap">
                            テラス: {formData.tera_type}
                        </span>
                    )}
                </div>

                {errorMsg && (
                    <div className="mx-6 md:mx-8 mb-2 p-4 bg-red-950/50 border-l-4 border-red-500 text-red-200 rounded-r text-sm">
                        <p className="font-bold">エラー</p>
                        <p>{errorMsg}</p>
                    </div>
                )}

                {/* 1. ポケモン選択・ステータス計算 */}
                <div className="px-6 md:px-8 pb-7">
                    <StatForm
                        initialPokemonName={isEditMode ? initialPokemonName : undefined}
                        // onStatusUpdate={handleStatusUpdate}
                    />
                </div>

                {/* 2. 基本情報 */}
                <section className={sectionWrap}>
                    <SectionEyebrow>基本情報</SectionEyebrow>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
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
                </section>

                {/* 3. 技構成 */}
                <section className={sectionWrap}>
                    <SectionEyebrow>技構成</SectionEyebrow>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                        {formData.moves.map((move, i) => (
                            <div key={i}>
                                <label className={labelStyle}>
                                    <span className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-slate-800 text-slate-400 text-[10px] font-bold mr-1.5 align-middle">
                                        {i + 1}
                                    </span>
                                    技 {i + 1}
                                </label>
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
                <section className={sectionWrap}>
                    <SectionEyebrow>メモ・調整意図</SectionEyebrow>
                    <textarea
                        name="memo"
                        value={formData.memo}
                        onChange={handleChange}
                        className={`${inputStyle} h-32 resize-y`}
                        placeholder="調整意図などを記入してください"
                    />
                </section>

                {/* アクションボタン */}
                <div className="px-6 md:px-8 py-5 border-t border-slate-800/80 bg-slate-900/40 flex justify-between items-center gap-4">
                    <Link
                        href="/builds"
                        className="px-5 py-2.5 text-sm font-bold text-slate-300 border border-slate-700 rounded-xl hover:bg-slate-800 transition-colors"
                    >
                        キャンセル
                    </Link>
                    <button
                        type="submit"
                        disabled={saving}
                        className="px-8 py-2.5 text-sm bg-gradient-to-r from-indigo-500 to-pink-500 text-white font-bold rounded-xl hover:brightness-110 disabled:opacity-50 transition-all shadow-md flex items-center justify-center min-w-[180px]"
                    >
                        {saving ? (
                            <>
                                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
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
            </div>
        </form>
    );
}