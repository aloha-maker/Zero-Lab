"use client";

import { useState, useRef, useEffect } from "react";
import StatusCalc from "./components/StatusCalc";

export default function MainPage() {
    return (
        <main className="p-8 max-w-4xl mx-auto">
            <h1 className="text-2xl font-bold mb-4">ポケモンステータス計算</h1>

            {/* 引数を渡して呼び出す */}
            <StatusCalc />

        </main>
    );
}