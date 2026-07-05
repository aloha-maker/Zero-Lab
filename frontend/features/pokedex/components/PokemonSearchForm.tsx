// src/features/pokedex/components/PokemonSearchForm.tsx
"use client";

import React, { useEffect, useRef } from "react";
import { usePokemonSearchForm } from "../hooks/usePokemonSearchForm";
import { usePokemonMaster } from "../hooks/usePokemonMaster";
import type { PokemonInfo } from "@/features/pokedex/types";

interface SearchFormProps {
    onSearchStart: () => void;
    onSearchSuccess: (data: PokemonInfo) => void;
    onSearchError: (message: string) => void;
}

export default function PokemonSearchForm({
    onSearchStart,
    onSearchSuccess,
    onSearchError,
}: SearchFormProps) {
    const { candidates, isMasterLoading } = usePokemonMaster();
    
    const { searchQuery, setSearchQuery, loading, handleSearch } = usePokemonSearchForm({
        onSearchStart,
        onSearchSuccess,
        onSearchError,
    });

    // リスト選択や確定時に「裏でAPIに送るための英語名」を安全に保持・同期するためのRef
    const pendingEnglishSearchRef = useRef<string | null>(null);
    // 検索ボックスに最終的に表示させたい日本語名を保持するRef
    const displayJapaneseNameRef = useRef<string | null>(null);

    // 入力値が変わった時（またはリスト選択時）の処理
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        
        // 1. まずはユーザーが入力・選択した文字（日本語名）をそのまま検索ボックスに表示
        setSearchQuery(value);

        if (!value.trim()) return;

        // 2. 入力された値がマスタデータの「日本語名」に完全一致するか検証
        const matchedPokemon = candidates.find((p) => p.jaName === value);

        // マスタに存在＝リストから日本語名が選ばれた、または日本語名が正しく入力完了した瞬間
        if (matchedPokemon) {
            // 後で戻すための日本語名と、APIに送るための英語名をRefに保存
            displayJapaneseNameRef.current = matchedPokemon.jaName;
            pendingEnglishSearchRef.current = matchedPokemon.name;

            // 3. 既存フックがURL生成に使う searchQuery ステートを一時的に「英語名」に書き換える
            setSearchQuery(matchedPokemon.name);
        }
    };

    // フック内の searchQuery ステートが「英語名」に切り替わった瞬間を安全にキャッチする
    useEffect(() => {
        // ステートがRefに保存した英語名と一致したら、準備完了として検索を実行
        if (pendingEnglishSearchRef.current && searchQuery === pendingEnglishSearchRef.current) {
            
            // 二重発火を防ぐために即座にクリア
            pendingEnglishSearchRef.current = null;

            // ダミーイベントで handleSearch を実行（裏側では英語名でリクエストが飛びます）
            const dummyEvent = {
                preventDefault: () => {},
            } as React.FormEvent;
            handleSearch(dummyEvent);

            // 4. 検索処理が走り出した直後に、検索ボックスの表示を日本語名にキープ・引き戻す
            if (displayJapaneseNameRef.current) {
                setSearchQuery(displayJapaneseNameRef.current);
                displayJapaneseNameRef.current = null;
            }
        }
    }, [searchQuery, handleSearch, setSearchQuery]);

    // 手動でEnterを押したときのフォールバック
    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            
            // もし入力されたものが日本語名マスタにあれば英語名に変えて検索
            const matchedPokemon = candidates.find((p) => p.jaName === searchQuery);
            if (matchedPokemon) {
                displayJapaneseNameRef.current = matchedPokemon.jaName;
                pendingEnglishSearchRef.current = matchedPokemon.name;
                setSearchQuery(matchedPokemon.name);
            } else {
                handleSearch(e as unknown as React.FormEvent);
            }
        }
    };

    const placeholderText = isMasterLoading
        ? "マスタデータ読み込み中..."
        : loading
        ? "検索中..."
        : "ポケモン名を入力...";

    return (
        <div className="w-full">
            <div className="flex items-center w-full relative">
                {/* 検索アイコン */}
                <svg
                    className="absolute left-3 h-4 w-4 text-slate-500 pointer-events-none"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35m1.35-5.65a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>

                <input
                    type="text"
                    list="pokemon-options"
                    value={searchQuery}
                    onChange={handleInputChange}
                    onKeyDown={handleKeyDown}
                    placeholder={placeholderText}
                    className="w-full pl-9 pr-9 py-2.5 bg-slate-950 border border-slate-800 rounded-lg focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none text-sm text-slate-100 placeholder-slate-600 disabled:opacity-50 transition-all"
                    disabled={loading || isMasterLoading}
                />

                {/* ローディング／クリアボタン */}
                {loading || isMasterLoading ? (
                    <div className="absolute right-3 flex items-center justify-center">
                        <div className="animate-spin h-4 w-4 border-2 border-indigo-500 border-t-transparent rounded-full"></div>
                    </div>
                ) : (
                    searchQuery && (
                        <button
                            type="button"
                            onClick={() => setSearchQuery("")}
                            className="absolute right-2.5 h-5 w-5 flex items-center justify-center rounded-full text-slate-500 hover:text-slate-200 hover:bg-slate-800 transition-colors"
                            aria-label="検索欄をクリア"
                        >
                            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    )
                )}
            </div>

            {/* リストの選択肢も日本語名のみ */}
            <datalist id="pokemon-options">
                {candidates.map((pokemon) => (
                    <option 
                        key={pokemon.id} 
                        value={pokemon.jaName}
                    />
                ))}
            </datalist>
        </div>
    );
}