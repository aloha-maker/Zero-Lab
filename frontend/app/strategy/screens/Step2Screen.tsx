export default function Step2Screen() {
    return (
      <section className="space-y-6 animate-in fade-in duration-300">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <h3 className="font-bold text-lg mb-4 text-slate-700">
            ターゲットに基づく補完候補の抽出
          </h3>
  
          <div className="bg-slate-50 p-4 rounded-lg mb-6 flex gap-4">
            {/* 討伐対象 */}
            <div className="flex-1">
              <p className="text-xs text-slate-500 font-medium">
                討伐必須ターゲット（× / △）
              </p>
  
              <p className="font-bold mt-1 text-red-600">
                ハバタクカミ, カイリュー
              </p>
            </div>
  
            {/* 不足要素 */}
            <div className="flex-1 border-l pl-4 border-slate-200">
              <p className="text-xs text-slate-500 font-medium">
                不足しているアーキタイプ要素
              </p>
  
              <p className="font-bold mt-1 text-slate-700">
                物理受け, 鋼枠
              </p>
            </div>
          </div>
  
          <button className="w-full bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-bold transition flex justify-center items-center gap-2">
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
              />
            </svg>
  
            データベースから候補をスクリーニング
          </button>
        </div>
  
        {/* モック候補一覧 */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <h3 className="font-bold text-lg mb-4 text-slate-700">
            推奨補完候補
          </h3>
  
          <div className="space-y-3">
            <div className="border border-slate-200 rounded-lg p-4 hover:bg-slate-50 transition">
              <div className="flex justify-between items-center">
                <div>
                  <h4 className="font-bold">ハッサム</h4>
  
                  <p className="text-sm text-slate-500 mt-1">
                    鋼枠 / フェアリー受け / 対ハバタクカミ
                  </p>
                </div>
  
                <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-bold">
                  適合率 92%
                </span>
              </div>
            </div>
  
            <div className="border border-slate-200 rounded-lg p-4 hover:bg-slate-50 transition">
              <div className="flex justify-between items-center">
                <div>
                  <h4 className="font-bold">ヒードラン</h4>
  
                  <p className="text-sm text-slate-500 mt-1">
                    特殊受け / 鋼枠 / サイクル補完
                  </p>
                </div>
  
                <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-bold">
                  適合率 88%
                </span>
              </div>
            </div>
  
            <div className="border border-slate-200 rounded-lg p-4 hover:bg-slate-50 transition">
              <div className="flex justify-between items-center">
                <div>
                  <h4 className="font-bold">ドオー</h4>
  
                  <p className="text-sm text-slate-500 mt-1">
                    物理受け / クッション
                  </p>
                </div>
  
                <span className="bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full text-sm font-bold">
                  適合率 81%
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }