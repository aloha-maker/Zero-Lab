"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function NewBuildPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    // フォームの入力状態を管理
    const [formData, setFormData] = useState({
        pokemon_id: 6, // 初期値（例: リザードン）
        pokemon_name: "リザードン",
        nature: "いじっぱり",
        ability: "もうか",
        item: "リザードナイトX",
        tera_type: "ほのお",
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const res = await fetch("http://localhost:8000/api/builds/", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(formData),
            });

            if (!res.ok) {
                throw new Error("登録に失敗しました");
            }

            // 成功したら一覧ページに戻る
            router.push("/builds");
        } catch (error) {
            console.error(error);
            alert("エラーが発生しました。バックエンドのログを確認してください。");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-8 max-w-2xl mx-auto">
            <h1 className="text-3xl font-bold mb-6">新規育成登録</h1>

            <form onSubmit={handleSubmit} className="space-y-4 border p-6 rounded-lg shadow-sm">
                <div>
                    <label className="block text-sm font-bold mb-1">ポケモン名</label>
                    <input
                        type="text"
                        name="pokemon_name"
                        value={formData.pokemon_name}
                        onChange={handleChange}
                        className="w-full border p-2 rounded text-black"
                        required
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-bold mb-1">性格</label>
                        <input
                            type="text"
                            name="nature"
                            value={formData.nature}
                            onChange={handleChange}
                            className="w-full border p-2 rounded text-black"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-bold mb-1">特性</label>
                        <input
                            type="text"
                            name="ability"
                            value={formData.ability}
                            onChange={handleChange}
                            className="w-full border p-2 rounded text-black"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-bold mb-1">持ち物</label>
                        <input
                            type="text"
                            name="item"
                            value={formData.item}
                            onChange={handleChange}
                            className="w-full border p-2 rounded text-black"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-bold mb-1">テラスタイプ</label>
                        <input
                            type="text"
                            name="tera_type"
                            value={formData.tera_type}
                            onChange={handleChange}
                            className="w-full border p-2 rounded text-black"
                        />
                    </div>
                </div>

                <div className="flex justify-between pt-4">
                    <Link href="/builds" className="px-4 py-2 bg-gray-300 text-black rounded hover:bg-gray-400">
                        キャンセル
                    </Link>
                    <button
                        type="submit"
                        disabled={loading}
                        className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                    >
                        {loading ? "保存中..." : "保存する"}
                    </button>
                </div>
            </form>
        </div>
    );
}