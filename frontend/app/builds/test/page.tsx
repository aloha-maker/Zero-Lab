// "use client";
// import { useState } from "react";
// import PokemonBuildForm from "../components/PokemonBuildForm";
// import type { BuildCreateRequest } from "@/app/types/api";

// // テスト用のモックデータ（型A）
// const mockPokemonA: BuildCreateRequest = {
//     pokemon_id: 10000,
//     pokemon_name: "ガブリアス",
//     nickname: "ぽにちゃん（アタッカー型）",
//     nature: "ようき",
//     ability: "おもかげやどし",
//     item: "かまどのめん",
//     tera_type: "ほのお",
//     moves: ["ツタこんぼう", "ウッドホーン", "がんせきふうじ", "じゃれつく"],
//     evs: { H: 4, A: 252, B: 0, C: 0, D: 0, S: 252 },
//     ivs: { H: 31, A: 31, B: 31, C: 31, D: 31, S: 31 },
//     memo: "最速ASぶっぱのシンプルなアタッカー調整です。"
// };

// // テスト用のモックデータ（型B）
// const mockPokemonB: BuildCreateRequest = {
//     pokemon_id: 20000,
//     pokemon_name: "ピカチュウ",
//     nickname: "かみちゃん（こだわり眼鏡型）",
//     nature: "おくびょう",
//     ability: "こだいかっせい",
//     item: "こだわりメガネ",
//     tera_type: "フェアリー",
//     moves: ["ムーンフォース", "シャドーボール", "マジカルフレイム", "パワージェム"],
//     evs: { H: 4, A: 0, B: 0, C: 252, D: 0, S: 252 },
//     ivs: { H: 31, A: 0, B: 31, C: 31, D: 31, S: 31 },
//     memo: "最速CSの特殊アタッカー。対面での削り性能を重視。"
// };


// export default function MainPage() {
//     // フォームに渡す現在のデータを管理するState（初期値はundefined = 空フォーム）
//     const [selectedData, setSelectedData] = useState<BuildCreateRequest | undefined>(undefined);
//     // 画面に表示する簡易的な通知メッセージ
//     const [message, setMessage] = useState<string | null>(null);

//     // 子フォームからデータが送られてきたときの処理（POST / PUT のダミー処理）
//     const handleFormSubmit = async (data: BuildCreateRequest, mode: "create" | "update") => {
//         if (mode === "update") {
//             setMessage(`⚠️ 【上書き保存（PUT）】既存の「${data.nickname || data.pokemon_name}」のデータを更新しました！`);
//         } else {
//             setMessage(`✨ 【新規・別名保存（POST）】「${data.nickname || data.pokemon_name}」を新しく登録しました！`);
//         }

//         // 3秒後にメッセージを消す
//         setTimeout(() => setMessage(null), 3000);
//     };

//     return (
//         <main className="min-h-screen bg-slate-950 text-slate-100 p-4 sm:p-8 selection:bg-indigo-500/30">
//             <div className="max-w-4xl mx-auto space-y-6">
                
//                 {/* ヘッダー */}
//                 <header className="border-b border-slate-800 pb-4">
//                     <h1 className="text-3xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-pink-400">
//                         育成ポケモン登録
//                     </h1>
//                     <p className="text-slate-400 text-sm mt-1">ポケモンのビルド構成を記録・管理します。</p>
//                 </header>

//                 {/* テスト用のデータ操作コントロールパネル */}
//                 <section className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-md space-y-3">
//                     <h2 className="text-sm font-bold text-slate-400 uppercase tracking-wider">登録データの呼び出しエミュレート</h2>
//                     <div className="flex flex-wrap gap-3">
//                         <button
//                             onClick={() => setSelectedData(mockPokemonA)}
//                             className="px-4 py-2 bg-indigo-600/20 hover:bg-indigo-600/30 border border-indigo-500/40 rounded-xl text-indigo-300 text-sm font-semibold transition-colors"
//                         >
//                             📁 オーガポン（型A）のデータを読み込む
//                         </button>
//                         <button
//                             onClick={() => setSelectedData(mockPokemonB)}
//                             className="px-4 py-2 bg-pink-600/20 hover:bg-pink-600/30 border border-pink-500/40 rounded-xl text-pink-300 text-sm font-semibold transition-colors"
//                         >
//                             📁 ハバタクカミ（型B）のデータを読み込む
//                         </button>
//                         <button
//                             onClick={() => setSelectedData(undefined)}
//                             className="px-4 py-2 bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded-xl text-slate-400 text-sm font-semibold transition-colors"
//                         >
//                             ❌ 選択を解除して空にする
//                         </button>
//                     </div>
//                 </section>

//                 {/* 送信完了などの通知メッセージ */}
//                 {message && (
//                     <div className="bg-slate-900 border border-emerald-500/50 text-emerald-400 px-4 py-3 rounded-xl text-sm font-medium transition-all">
//                         {message}
//                     </div>
//                 )}

//                 {/* 登録フォームコンポーネント */}
//                 <PokemonBuildForm 
//                     initialData={selectedData} 
//                     onSubmit={handleFormSubmit} 
//                 />

//             </div>
//         </main>
//     );
// }