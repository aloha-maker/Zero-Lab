"use client";
import { useState, useEffect } from "react";
import Link from "next/link";

// 型定義はバックエンドのスキーマと合わせる
type PokemonBuild = {
    id: string;
    pokemon_name: string;
    nature: string;
    item: string;
    tera_type: string;
    // ...他プロパティ
};

export default function BuildsPage() {
    const [builds, setBuilds] = useState<PokemonBuild[]>([]);

    const fetchBuilds = async () => {
        const res = await fetch("http://localhost:8000/api/builds/");
        const data = await res.json();
        setBuilds(data);
    };

    useEffect(() => {
        fetchBuilds();
    }, []);

    const handleDelete = async (id: string) => {
        if (!confirm("削除しますか？")) return;
        await fetch(`http://localhost:8000/api/builds/${id}`, { method: "DELETE" });
        fetchBuilds();
    };

    const handleCopy = async (id: string) => {
        await fetch(`http://localhost:8000/api/builds/${id}/copy`, { method: "POST" });
        fetchBuilds(); // リストを更新してコピーを表示
    };

    return (
        <div className="p-8 max-w-4xl mx-auto">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold">育成ボックス</h1>
                <Link href="/builds/new" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition">
                    + 新規登録
                </Link>
            </div>

            <div className="grid gap-4">
                {builds.map((build) => (
                    <div key={build.id} className="border p-4 rounded shadow flex justify-between items-center">
                        <div>
                            <h2 className="text-xl font-bold">{build.pokemon_name}</h2>
                            <p className="text-sm text-gray-500">
                                持ち物: {build.item} / 性格: {build.nature} / テラス: {build.tera_type}
                            </p>
                        </div>
                        <div className="space-x-2">
                            <button onClick={() => handleCopy(build.id)} className="px-3 py-1 bg-green-500 text-white rounded">
                                コピー
                            </button>
                            <button className="px-3 py-1 bg-yellow-500 text-white rounded">
                                編集
                            </button>
                            <button onClick={() => handleDelete(build.id)} className="px-3 py-1 bg-red-500 text-white rounded">
                                削除
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}