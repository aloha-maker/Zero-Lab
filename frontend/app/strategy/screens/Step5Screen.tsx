export default function Step5Screen() {
    return (
      <section className="space-y-6 animate-in fade-in duration-300">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* 左側 */}
          <div className="md:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-slate-200">
            <h3 className="font-bold text-lg mb-4 text-slate-700">
              仮想敵からの努力値逆算（S→火力→耐久）
            </h3>
  
            <div className="space-y-4">
              {/* S */}
              <div className="p-4 border border-blue-200 bg-blue-50 rounded-lg">
                <label className="block text-sm font-bold text-blue-800 mb-2">
                  ターゲットS（素早さ）
                </label>
  
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="例: 最速サーフゴー"
                    className="flex-1 px-3 py-2 border border-blue-200 rounded focus:outline-none focus:border-blue-400"
                  />
  
                  <span className="flex items-center px-3 bg-white border border-blue-200 rounded font-mono text-sm">
                    必要実数値: 150
                  </span>
                </div>
              </div>
  
              {/* A */}
              <div className="p-4 border border-red-200 bg-red-50 rounded-lg">
                <label className="block text-sm font-bold text-red-800 mb-2">
                  ターゲットA（火力）
                </label>
  
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="例: 無振りハバタクカミ"
                    className="flex-1 px-3 py-2 border border-red-200 rounded focus:outline-none focus:border-red-400"
                  />
  
                  <input
                    type="text"
                    placeholder="使用技: じしん"
                    className="w-1/3 px-3 py-2 border border-red-200 rounded focus:outline-none focus:border-red-400"
                  />
                </div>
              </div>
  
              {/* D */}
              <div className="p-4 border border-green-200 bg-green-50 rounded-lg">
                <label className="block text-sm font-bold text-green-800 mb-2">
                  ターゲットD（耐久）
                </label>
  
                <input
                  type="text"
                  placeholder="例: 特化カイリューのしんそく"
                  className="w-full px-3 py-2 border border-green-200 rounded focus:outline-none focus:border-green-400"
                />
              </div>
  
              {/* 計算結果モック */}
              <div className="mt-6 border-t pt-4">
                <h4 className="font-semibold mb-3 text-slate-700">
                  計算結果
                </h4>
  
                <div className="grid md:grid-cols-3 gap-3">
                  <div className="bg-slate-50 border rounded-lg p-4">
                    <p className="text-xs text-slate-500">必要素早さ</p>
                    <p className="font-bold text-2xl text-blue-600">
                      S 252
                    </p>
                  </div>
  
                  <div className="bg-slate-50 border rounded-lg p-4">
                    <p className="text-xs text-slate-500">必要火力</p>
                    <p className="font-bold text-2xl text-red-600">
                      A 252
                    </p>
                  </div>
  
                  <div className="bg-slate-50 border rounded-lg p-4">
                    <p className="text-xs text-slate-500">必要耐久</p>
                    <p className="font-bold text-2xl text-green-600">
                      H 4
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
  
          {/* 右側 */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
            <h3 className="font-bold text-lg mb-4 text-slate-700">
              努力値リソース
            </h3>
  
            <div className="mb-2 flex justify-between text-sm font-bold">
              <span>使用合計</span>
              <span className="text-blue-600">
                510 / 508
              </span>
            </div>
  
            <div className="w-full bg-slate-200 rounded-full h-3 mb-6">
              <div
                className="bg-red-500 h-3 rounded-full"
                style={{ width: "100%" }}
              />
            </div>
  
            {/* 警告 */}
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm font-medium mb-4">
              ⚠️ オーバーフロー検知！
              <br />
              指定の耐久を確保できません。
              <br />
              持ち物を
              「とつげきチョッキ」
              に変更するか、
              火力ターゲットを妥協してください。
            </div>
  
            {/* 努力値配分 */}
            <div className="space-y-2 font-mono text-sm">
              <div className="flex justify-between">
                <span>H:</span>
                <span className="font-bold">4</span>
              </div>
  
              <div className="flex justify-between">
                <span>A:</span>
                <span className="font-bold">252</span>
              </div>
  
              <div className="flex justify-between">
                <span>B:</span>
                <span className="font-bold">0</span>
              </div>
  
              <div className="flex justify-between">
                <span>C:</span>
                <span className="font-bold">0</span>
              </div>
  
              <div className="flex justify-between">
                <span>D:</span>
                <span className="font-bold">0</span>
              </div>
  
              <div className="flex justify-between">
                <span>S:</span>
                <span className="font-bold">252</span>
              </div>
            </div>
  
            <button className="w-full mt-6 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg font-medium transition">
              再計算
            </button>
          </div>
        </div>
      </section>
    );
  }