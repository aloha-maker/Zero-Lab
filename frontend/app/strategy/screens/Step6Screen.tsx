export default function Step6Screen() {
    return (
      <section className="space-y-6 animate-in fade-in duration-300">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* KPIエリア */}
          <div className="md:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-slate-200">
            <div className="flex justify-between items-end mb-6">
              <div>
                <h3 className="font-bold text-lg text-slate-700">
                  スプリント運用テスト（30戦）
                </h3>
  
                <p className="text-sm text-slate-500">
                  現在: 18戦完了
                </p>
              </div>
  
              <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded font-medium text-sm transition">
                + バトル記録を追加
              </button>
            </div>
  
            {/* 勝率 */}
            <div className="mb-8">
              <div className="flex justify-between text-sm font-bold mb-1">
                <span>
                  トータル勝率（目標: 50%+）
                </span>
  
                <span className="text-red-600">
                  38.8% (7勝11敗)
                </span>
              </div>
  
              <div className="w-full bg-slate-200 rounded-full h-4">
                <div
                  className="bg-red-500 h-4 rounded-full"
                  style={{ width: "38.8%" }}
                />
              </div>
            </div>
  
            {/* 選出率テーブル */}
            <table className="w-full text-sm text-left">
              <thead className="text-slate-500 border-b border-slate-200">
                <tr>
                  <th className="pb-2">
                    ポケモン
                  </th>
  
                  <th className="pb-2">
                    選出率（KPI:15%+）
                  </th>
  
                  <th className="pb-2 text-right">
                    ステータス
                  </th>
                </tr>
              </thead>
  
              <tbody className="divide-y divide-slate-100">
                <tr>
                  <td className="py-3 font-medium">
                    ガブリアス（主軸）
                  </td>
  
                  <td className="py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-24 bg-slate-200 rounded-full h-2">
                        <div
                          className="bg-green-500 h-2 rounded-full"
                          style={{ width: "80%" }}
                        />
                      </div>
  
                      <span>80%</span>
                    </div>
                  </td>
  
                  <td className="py-3 text-right">
                    <span className="text-green-600 font-bold text-xs bg-green-50 px-2 py-1 rounded">
                      健全
                    </span>
                  </td>
                </tr>
  
                <tr>
                  <td className="py-3 font-medium">
                    ハッサム（5枠目）
                  </td>
  
                  <td className="py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-24 bg-slate-200 rounded-full h-2">
                        <div
                          className="bg-red-500 h-2 rounded-full"
                          style={{ width: "5%" }}
                        />
                      </div>
  
                      <span className="text-red-600 font-bold">
                        5%
                      </span>
                    </div>
                  </td>
  
                  <td className="py-3 text-right">
                    <span className="text-red-600 font-bold text-xs bg-red-50 px-2 py-1 rounded">
                      エラー検出
                    </span>
                  </td>
                </tr>
  
                <tr>
                  <td className="py-3 font-medium">
                    サーフゴー
                  </td>
  
                  <td className="py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-24 bg-slate-200 rounded-full h-2">
                        <div
                          className="bg-green-500 h-2 rounded-full"
                          style={{ width: "45%" }}
                        />
                      </div>
  
                      <span>45%</span>
                    </div>
                  </td>
  
                  <td className="py-3 text-right">
                    <span className="text-green-600 font-bold text-xs bg-green-50 px-2 py-1 rounded">
                      健全
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
  
          {/* システム判定 */}
          <div className="bg-slate-900 text-white p-6 rounded-xl shadow-lg border border-slate-700">
            <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
              <span>⚡</span>
              システム判定
            </h3>
  
            <div className="space-y-4">
              <div className="bg-red-900/50 border border-red-500 p-3 rounded-lg">
                <p className="text-xs text-red-300 font-bold mb-1">
                  エラーA: 選出率15%未満
                </p>
  
                <p className="text-sm font-medium">
                  「ハッサム」の解雇を推奨します。
                  STEP2へ戻り、代替の鋼枠を再計算してください。
                </p>
              </div>
  
              <div className="bg-yellow-900/50 border border-yellow-500 p-3 rounded-lg">
                <p className="text-xs text-yellow-300 font-bold mb-1">
                  警告: 技の稼働率0%
                </p>
  
                <p className="text-sm font-medium">
                  ガブリアスの「アイアンヘッド」が
                  一度も使用されていません。
                  「みがわり」への変更を提案します。
                </p>
              </div>
  
              <div className="bg-blue-900/50 border border-blue-500 p-3 rounded-lg">
                <p className="text-xs text-blue-300 font-bold mb-1">
                  情報
                </p>
  
                <p className="text-sm font-medium">
                  現在の構築勝率は目標値を
                  下回っています。
                  あと12戦で再評価を実施します。
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }