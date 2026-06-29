"use client";

import { useEffect, useRef } from "react";
import type { PokemonInfo } from "@/app/types/api";
import PokemonSearchForm from "./PokemonSearchForm";

interface PokemonSearchModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSearchStart: () => void;
    onSearchSuccess: (data: PokemonInfo) => void;
    onSearchError: (message: string) => void;
    searchError: string | null;
}

export default function PokemonSearchModal({
    isOpen,
    onClose,
    onSearchStart,
    onSearchSuccess,
    onSearchError,
    searchError,
}: PokemonSearchModalProps) {
    const dialogRef = useRef<HTMLDialogElement>(null);

    // 親コンポーネントからの開閉フラグを監視して、実際のDOM操作を行う
    useEffect(() => {
        const dialog = dialogRef.current;
        if (!dialog) return;

        if (isOpen) {
            if (!dialog.open) dialog.showModal();
        } else {
            if (dialog.open) dialog.close();
        }
    }, [isOpen]);

    return (
        <dialog
            ref={dialogRef}
            onClose={onClose}
            className="fixed inset-0 m-auto backdrop:bg-slate-950/70 bg-slate-900 border border-slate-800 text-slate-100 p-6 rounded-2xl max-w-md w-11/12 sm:w-full shadow-2xl outline-none"
        >
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold text-slate-200">ポケモンの検索</h3>
                <button 
                    onClick={onClose}
                    className="text-slate-400 hover:text-slate-200 transition-colors p-1"
                    type="button"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            </div>

            {/* 検索フォームコンポーネント */}
            <PokemonSearchForm 
                onSearchStart={onSearchStart}
                onSearchSuccess={onSearchSuccess}
                onSearchError={onSearchError}
            />

            {/* 検索フォームのエラーメッセージ */}
            {searchError && (
                <div className="mt-4 p-3 bg-red-950/50 border-l-4 border-red-500 text-red-200 text-sm rounded">
                    <p>{searchError}</p>
                </div>
            )}
        </dialog>
    );
}