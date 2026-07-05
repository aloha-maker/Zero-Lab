"use client";

import { useState, useCallback } from "react";
import StatForm from "@/features/stat-calculator/components/StatForm";

// 親コンポーネント側で管理するステータスデータの型
interface UpdatedStatusData {
    pokemon_id?: number;
    pokemon_name?: string;
    nature?: string;
    evs?: { H: number; A: number; B: number; C: number; D: number; S: number };
}

export default function TrainedManagementPage() {
    // StatForm から上がってくる最新のステータスを保持する状態
    const [currentStatus, setCurrentStatus] = useState<UpdatedStatusData | null>(null);

    // フォーム内でポケモンや努力値が変更されたときに実行されるコールバック    
    const handleStatusUpdate = useCallback((data: UpdatedStatusData) => {
        setCurrentStatus(data);
    }, []);
    
    return (
        <div className="container mx-auto px-4 py-8 max-w-4xl">
            <header className="mb-8 flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-slate-100">ステータス計算</h1>
                    <p className="text-sm text-slate-400 mt-1">ポケモンの努力値調整と実数値の計算を行います</p>
                </div>
            </header>

            <main className="space-y-6">
                {/* StatForm の呼び出し */}
                <StatForm onStatusUpdate={handleStatusUpdate} />

                {/* 親コンポーネント側で現在の状態を確認するためのデバッグ表示（開発用） */}
                {currentStatus && (
                    <div className="p-4 bg-slate-800 border border-slate-700 rounded-xl text-xs text-slate-300 font-mono">
                        <p className="font-bold text-slate-400 mb-2">【親コンポーネントが検知している状態】</p>
                        <pre>{JSON.stringify(currentStatus, null, 2)}</pre>
                    </div>
                )}
            </main>
        </div>
    );
}