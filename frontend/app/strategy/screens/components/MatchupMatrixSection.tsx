export default function MatchupMatrixSection() {
    return (
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-bold text-lg text-slate-700">
            環境トップとの有利不利マトリクス
          </h3>
          <button className="text-blue-600 text-sm font-medium hover:underline">
            ダメージ計算を自動実行
          </button>
        </div>
  
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-100 text-slate-600">
              <tr>
                <th className="p-3 rounded-tl-lg">環境ポケモン</th>
                <th className="p-3 text-center">対面判定</th>
                <th className="p-3 rounded-tr-lg">不利理由カテゴリー</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              <tr>
                <td className="p-3 font-medium">1. カイリュー</td>
                <td className="p-3 text-center">
                  <span className="bg-yellow-100 text-yellow-700 font-bold px-3 py-1 rounded">△</span>
                </td>
                <td className="p-3 text-slate-600">行動保障（マルチスケイル）</td>
              </tr>
              <tr>
                <td className="p-3 font-medium">2. ハバタクカミ</td>
                <td className="p-3 text-center">
                  <span className="bg-red-100 text-red-700 font-bold px-3 py-1 rounded">×</span>
                </td>
                <td className="p-3 text-slate-600">速度負け</td>
              </tr>
              <tr>
                <td className="p-3 font-medium">3. サーフゴー</td>
                <td className="p-3 text-center">
                  <span className="bg-blue-100 text-blue-700 font-bold px-3 py-1 rounded">◎</span>
                </td>
                <td className="p-3 text-slate-400">-</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    );
  }