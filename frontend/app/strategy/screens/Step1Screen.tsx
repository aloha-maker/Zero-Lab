export default function Step1Screen() {
    const tags = [
      { label: "崩し性能", checked: true },
      { label: "行動保障", checked: false },
      { label: "対面操作", checked: false },
      { label: "縛り性能", checked: true },
      { label: "耐久・回復", checked: false },
    ];
  
    return (
      <section className="space-y-6 animate-in fade-in duration-300">
        {/* 主軸設定 */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <h3 className="font-bold text-lg mb-4 text-slate-700">
            主軸ポケモンの設定とタグ付け
          </h3>
  
          <div className="flex gap-4 mb-6">
            <input
              type="text"
              defaultValue="ガブリアス"
              placeholder="ポケモン名を入力"
              className="flex-1 px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
  
            <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition">
              データ取得
            </button>
          </div>
  
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {tags.map((tag) => (
              <label
                key={tag.label}
                className="flex items-center gap-2 bg-slate-50 p-3 rounded-lg border border-slate-200 cursor-pointer hover:bg-slate-100"
              >
                <input
                  type="checkbox"
                  defaultChecked={tag.checked}
                  className="w-4 h-4"
                />
                <span className="text-sm font-medium">
                  {tag.label}
                </span>
              </label>
            ))}
          </div>
        </div>
  
        {/* 相性表 */}
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
                  <th className="p-3 rounded-tl-lg">
                    環境ポケモン
                  </th>
  
                  <th className="p-3 text-center">
                    対面判定
                  </th>
  
                  <th className="p-3 rounded-tr-lg">
                    不利理由カテゴリー
                  </th>
                </tr>
              </thead>
  
              <tbody className="divide-y divide-slate-100">
                <tr>
                  <td className="p-3 font-medium">
                    1. カイリュー
                  </td>
  
                  <td className="p-3 text-center">
                    <span className="bg-yellow-100 text-yellow-700 font-bold px-3 py-1 rounded">
                      △
                    </span>
                  </td>
  
                  <td className="p-3 text-slate-600">
                    行動保障（マルチスケイル）
                  </td>
                </tr>
  
                <tr>
                  <td className="p-3 font-medium">
                    2. ハバタクカミ
                  </td>
  
                  <td className="p-3 text-center">
                    <span className="bg-red-100 text-red-700 font-bold px-3 py-1 rounded">
                      ×
                    </span>
                  </td>
  
                  <td className="p-3 text-slate-600">
                    速度負け
                  </td>
                </tr>
  
                <tr>
                  <td className="p-3 font-medium">
                    3. サーフゴー
                  </td>
  
                  <td className="p-3 text-center">
                    <span className="bg-blue-100 text-blue-700 font-bold px-3 py-1 rounded">
                      ◎
                    </span>
                  </td>
  
                  <td className="p-3 text-slate-400">
                    -
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>
    );
  }