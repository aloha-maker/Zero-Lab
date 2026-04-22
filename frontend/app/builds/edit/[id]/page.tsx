"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

// よく使われる性格のステータス補正（[1.1倍になる項目, 0.9倍になる項目]）
const NATURE_MODIFIERS: Record<string, [string, string]> = {
    "いじっぱり": ["A", "C"], "ひかえめ": ["C", "A"], "おくびょう": ["S", "A"], "ようき": ["S", "C"],
    "ずぶとい": ["B", "A"], "わんぱく": ["B", "C"], "おだやか": ["D", "A"], "しんちょう": ["D", "C"],
    "なまいき": ["D", "S"], "ゆうかん": ["A", "S"], "のんき": ["B", "S"], "れいせい": ["C", "S"],
    "むじゃき": ["S", "D"], "うっかりや": ["C", "D"], "やんちゃ": ["A", "D"],
    "さみしがり": ["A", "B"], "おっとり": ["C", "B"], "せっかち": ["S", "B"],
};

export default function EditBuildPage({ params }: { params: Promise<{ id: string }> }) {
    const router = useRouter();
    const { id } = use(params);

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    // PokeAPIから取得した種族値を保持するステート
    const [baseStats, setBaseStats] = useState({ H: 0, A: 0, B: 0, C: 0, D: 0, S: 0 });

    const [formData, setFormData] = useState({
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
    });

    // 1. Supabaseから既存データを取得
    useEffect(() => {
        const fetchExistingData = async () => {
            try {
                const res = await fetch(`http://localhost:8000/api/builds/${id}?t=${new Date().getTime()}`, { cache: 'no-store' });
                if (!res.ok) throw new Error("取得失敗");

                const current = await res.json();

                setFormData({
                    pokemon_id: current.pokemon_id || 0,
                    pokemon_name: current.pokemon_name || "",
                    nickname: current.nickname || "",
                    nature: current.nature || "",
                    ability: current.ability || "",
                    item: current.item || "",
                    tera_type: current.tera_type || "",
                    moves: [
                        current.moves?.[0] || "", current.moves?.[1] || "",
                        current.moves?.[2] || "", current.moves?.[3] || ""
                    ],
                    evs: current.evs || { H: 0, A: 0, B: 0, C: 0, D: 0, S: 0 },
                    ivs: current.ivs || { H: 31, A: 31, B: 31, C: 31, D: 31, S: 31 },
                    memo: current.memo || ""
                });
            } catch (error) {
                console.error("データ取得失敗", error);
                alert("データの取得に失敗しました。一覧に戻ります。");
                router.push("/builds");
            } finally {
                setLoading(false);
            }
        };
        fetchExistingData();
    }, [id, router]);

    // 2. 図鑑番号(pokemon_id)が変わったらPokeAPIから種族値を引っ張ってくる
    useEffect(() => {
        if (formData.pokemon_id === 0) return;

        const fetchBaseStats = async () => {
            try {
                const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${formData.pokemon_id}`);
                if (res.ok) {
                    const data = await res.json();
                    setBaseStats({
                        H: data.stats[0].base_stat,
                        A: data.stats[1].base_stat,
                        B: data.stats[2].base_stat,
                        C: data.stats[3].base_stat,
                        D: data.stats[4].base_stat,
                        S: data.stats[5].base_stat,
                    });
                }
            } catch (error) {
                console.error("PokeAPIからの種族値取得に失敗", error);
            }
        };
        fetchBaseStats();
    }, [formData.pokemon_id]);

    // ▼ レベル50時点での実数値計算ロジック ▼
    const calculateStat = (statName: string, base: number, iv: number, ev: number, nature: string) => {
        if (base === 0) return 0; // 種族値がまだ取れていない場合は0

        // 計算のコア部分: (種族値×2 ＋ 個体値 ＋ 努力値/4) ÷ 2 （※切り捨て）
        const core = Math.floor((base * 2 + iv + Math.floor(ev / 4)) / 2);

        if (statName === "H") {
            return core + 60; // HPは (コア + 10 + レベル50)
        }

        // HP以外は性格補正をかける
        let modifier = 1.0;
        const natureMod = NATURE_MODIFIERS[nature];
        if (natureMod) {
            if (natureMod[0] === statName) modifier = 1.1; // 上昇補正
            if (natureMod[1] === statName) modifier = 0.9; // 下降補正
        }

        return Math.floor((core + 5) * modifier);
    };

    // フォームの入力ハンドラー
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        // pokemon_idだけは数値として保存する
        setFormData({ ...formData, [name]: name === "pokemon_id" ? parseInt(value) || 0 : value });
    };

    const handleNestedChange = (category: 'evs' | 'ivs', stat: string, value: string) => {
        setFormData({
            ...formData,
            [category]: { ...formData[category], [stat]: parseInt(value) || 0 }
        });
    };

    const handleMoveChange = (index: number, value: string) => {
        const newMoves = [...formData.moves];
        newMoves[index] = value;
        setFormData({ ...formData, moves: newMoves });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            const res = await fetch(`http://localhost:8000/api/builds/${id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });

            if (res.ok) {
                alert("保存しました！");
                router.push("/builds");
                router.refresh();
            } else {
                const errData = await res.json();
                alert(`保存失敗: ${errData.detail || "不明なエラー"}`);
            }
        } catch (error) {
            alert("通信エラーが発生しました");
        } finally {
            setSaving(false);
        }
    };

    if (loading || !formData) return <div className="p-8 text-black">読み込み中...</div>;

    const inputStyle = "w-full bg-white border-2 border-gray-300 p-2 rounded text-black focus:border-blue-500 outline-none";
    const labelStyle = "block text-sm font-bold mb-1 text-gray-700 uppercase";

    return (
        <div className="p-8 max-w-4xl mx-auto bg-gray-100 min-h-screen">
            <h1 className="text-3xl font-bold mb-6 text-gray-800 border-b-2 border-blue-500 pb-2">育成データの編集</h1>

            <form onSubmit={handleSubmit} className="space-y-6 bg-white p-8 rounded-xl shadow-lg">

                {/* 基本情報 */}
                <section>
                    <h2 className="text-xl font-bold mb-4 text-blue-600 border-l-4 border-blue-600 pl-2">基本情報</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="grid grid-cols-3 gap-2">
                            <div className="col-span-1">
                                <label className={labelStyle}>図鑑番号</label>
                                <input type="number" name="pokemon_id" value={formData.pokemon_id} onChange={handleChange} className={inputStyle} required />
                            </div>
                            <div className="col-span-2">
                                <label className={labelStyle}>ポケモン名</label>
                                <input type="text" name="pokemon_name" value={formData.pokemon_name} onChange={handleChange} className={inputStyle} required />
                            </div>
                        </div>
                        <div>
                            <label className={labelStyle}>ニックネーム</label>
                            <input type="text" name="nickname" value={formData.nickname} onChange={handleChange} className={inputStyle} />
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                            <div><label className={labelStyle}>性格</label><input type="text" name="nature" value={formData.nature} onChange={handleChange} placeholder="例: いじっぱり" className={inputStyle} /></div>
                            <div><label className={labelStyle}>特性</label><input type="text" name="ability" value={formData.ability} onChange={handleChange} className={inputStyle} /></div>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                            <div><label className={labelStyle}>持ち物</label><input type="text" name="item" value={formData.item} onChange={handleChange} className={inputStyle} /></div>
                            <div><label className={labelStyle}>テラス</label><input type="text" name="tera_type" value={formData.tera_type} onChange={handleChange} className={inputStyle} /></div>
                        </div>
                    </div>
                </section>

                {/* 技構成 */}
                <section>
                    <h2 className="text-xl font-bold mb-4 text-blue-600 border-l-4 border-blue-600 pl-2">技構成</h2>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                        {formData.moves.map((move, i) => (
                            <div key={i}>
                                <label className={labelStyle}>技 {i + 1}</label>
                                <input type="text" value={move} onChange={(e) => handleMoveChange(i, e.target.value)} className={inputStyle} />
                            </div>
                        ))}
                    </div>
                </section>

                {/* ステータス表 (実数値計算) */}
                <section>
                    <h2 className="text-xl font-bold mb-4 text-blue-600 border-l-4 border-blue-600 pl-2">ステータス (Lv.50)</h2>
                    <div className="overflow-x-auto border rounded-lg">
                        <table className="w-full text-left border-collapse min-w-max">
                            <thead>
                                <tr className="bg-gray-100 border-b-2 border-gray-300">
                                    <th className="p-3 text-gray-700">項目</th>
                                    <th className="p-3 text-gray-700">種族値</th>
                                    <th className="p-3 text-gray-700">個体値 (IV)</th>
                                    <th className="p-3 text-gray-700">努力値 (EV)</th>
                                    <th className="p-3 font-bold text-blue-600">実数値</th>
                                </tr>
                            </thead>
                            <tbody>
                                {['H', 'A', 'B', 'C', 'D', 'S'].map((s) => {
                                    const base = baseStats[s as keyof typeof baseStats];
                                    const iv = formData.ivs[s as keyof typeof formData.ivs];
                                    const ev = formData.evs[s as keyof typeof formData.evs];
                                    const actual = calculateStat(s, base, iv, ev, formData.nature);

                                    // 性格による実数値の色付け
                                    let statColor = "text-black";
                                    if (NATURE_MODIFIERS[formData.nature]) {
                                        if (NATURE_MODIFIERS[formData.nature][0] === s) statColor = "text-red-600 font-bold";
                                        if (NATURE_MODIFIERS[formData.nature][1] === s) statColor = "text-blue-600 font-bold";
                                    }

                                    return (
                                        <tr key={s} className="border-b border-gray-200 hover:bg-gray-50">
                                            <td className="p-3 font-bold text-gray-800">{s}</td>
                                            <td className="p-3 text-gray-500 font-mono">{base || "-"}</td>
                                            <td className="p-2">
                                                <input type="number" min="0" max="31" value={iv} onChange={(e) => handleNestedChange('ivs', s, e.target.value)} className="w-20 border-2 border-gray-300 p-1 rounded text-center text-black" />
                                            </td>
                                            <td className="p-2">
                                                <input type="number" min="0" max="252" step="4" value={ev} onChange={(e) => handleNestedChange('evs', s, e.target.value)} className="w-24 border-2 border-gray-300 p-1 rounded text-center text-black" />
                                            </td>
                                            <td className={`p-3 text-xl ${statColor} font-mono`}>
                                                {base ? actual : "-"}
                                            </td>
                                        </tr>
                                    )
                                })}
                            </tbody>
                        </table>
                    </div>
                    <p className="text-xs text-gray-500 mt-2">※性格に「いじっぱり」等を入力すると、実数値に赤（上昇1.1倍）や青（下降0.9倍）の補正がかかります。</p>
                </section>

                {/* メモ */}
                <section>
                    <h2 className="text-xl font-bold mb-4 text-blue-600 border-l-4 border-blue-600 pl-2">メモ・調整意図</h2>
                    <textarea name="memo" value={formData.memo} onChange={handleChange} className={`${inputStyle} h-24`} placeholder="最速ガブリアス抜き、珠ダメ最小調整 など" />
                </section>

                {/* ボタン */}
                <div className="flex justify-between pt-6 border-t border-gray-200">
                    <Link href="/builds" className="px-6 py-2 bg-gray-500 text-white font-bold rounded-lg hover:bg-gray-600 transition shadow-md">
                        キャンセル
                    </Link>
                    <button type="submit" disabled={saving} className="px-8 py-2 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 disabled:opacity-50 shadow-md">
                        {saving ? "更新中..." : "変更を保存する"}
                    </button>
                </div>
            </form>
        </div>
    );
}