"use client";

import Link from "next/link";
import { useTrainedList } from "../hooks/useTrainedList";

export const TrainedList = () => {
    // ロジックはすべてフックから取得
    const { builds, errorMsg, handleDelete } = useTrainedList();

    return (
        <div className="p-8 max-w-5xl mx-auto bg-gray-50 min-h-screen">
            <div className="flex justify-between items-center mb-6 border-b-2 border-blue-500 pb-2">
                <h1 className="text-3xl font-bold text-gray-800">育成論一覧</h1>
                <Link href="/builds/new" className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded transition shadow">
                    ＋ 新規登録
                </Link>
            </div>

            {errorMsg && (
                <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded-r-lg">
                    <p className="font-medium">{errorMsg}</p>
                </div>
            )}

            {builds.length === 0 && !errorMsg ? (
                <p className="text-gray-500 text-center py-10 bg-white rounded shadow-sm">まだ育成論が登録されていません</p>
            ) : (
                <div className="overflow-x-auto bg-white rounded-lg shadow-sm border border-gray-200">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-100 border-b border-gray-300 text-gray-700">
                                <th className="py-3 px-4 font-bold whitespace-nowrap">ポケモン</th>
                                <th className="py-3 px-4 font-bold whitespace-nowrap">性格</th>
                                <th className="py-3 px-4 font-bold whitespace-nowrap">持ち物</th>
                                <th className="py-3 px-4 font-bold whitespace-nowrap">テラスタイプ</th>
                                <th className="py-3 px-4 font-bold text-center whitespace-nowrap">操作</th>
                            </tr>
                        </thead>
                        <tbody>
                            {builds.map(b => (
                                <tr key={b.id} className="border-b border-gray-200 hover:bg-gray-50 transition">
                                    <td className="py-3 px-4 font-medium text-gray-800">
                                        {b.pokemon_name}
                                        {b.nickname && (
                                            <span className="text-gray-500 text-sm font-normal ml-2">
                                                ({b.nickname})
                                            </span>
                                        )}
                                    </td>
                                    <td className="py-3 px-4 text-gray-600">{b.nature}</td>
                                    <td className="py-3 px-4 text-gray-600">{b.item}</td>
                                    <td className="py-3 px-4 text-gray-600">{b.tera_type}</td>
                                    <td className="py-3 px-4">
                                        <div className="flex justify-center gap-2">
                                            <Link href={`/builds/edit/${b.id}`} className="text-center bg-green-100 hover:bg-green-200 text-green-700 py-1 px-3 rounded text-sm font-bold transition whitespace-nowrap">
                                                編集
                                            </Link>
                                            <button onClick={() => handleDelete(b.id)} className="bg-red-100 hover:bg-red-200 text-red-700 py-1 px-3 rounded text-sm font-bold transition whitespace-nowrap">
                                                削除
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};